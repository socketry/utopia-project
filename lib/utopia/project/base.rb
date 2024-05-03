# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2022, by Samuel Williams.

require 'utopia/path'
require 'utopia/content/links'

require 'xrb/reference'
require 'decode'

require 'thread/local'

require_relative 'document'
require_relative 'guide'
require_relative 'linkify'

module Utopia
	module Project
		# Provides structured access to a project directory which contains source code and guides.
		class Base
			extend Thread::Local
			
			def self.local
				instance = self.new
				
				source_files = Dir.glob(
					File.expand_path("{lib,app}/**/*.rb", instance.root)
				)
				
				instance.update(source_files)
				
				return instance
			end
			
			# Initialize the project with the given root path.
			# @parameter root [String] The file-system path to the root of the project.
			def initialize(root = Dir.pwd)
				@root = root
				
				@source_path = Utopia::Path["/source"]
				
				@index = Decode::Index.new
				
				@links = Utopia::Content::Links.new(@root)
			end
			
			# The file-system path to the root of the project.
			# @attribute [String]
			attr :root
			
			# The source code index which is used for generating pages.
			# @attribute [Decode::Index]
			attr :index
			
			# Return the absolute path for the given file name, if it exists in the project.
			# @parameter file_name [String] The relative path to the project file, e.g. `readme.md`.
			# @returns [String] The file-system path.
			def path_for(file_name)
				full_path = File.expand_path(file_name, @root)
				if File.exist?(full_path)
					return full_path
				end
			end
			
			# Update the index with the specified paths.
			# @parameter paths [Array(String)] The paths to load and parse.
			def update(paths)
				@index.update(paths)
			end
			
			# Given an array of defintions, return the best definition for the purposes of generating documentation.
			# @returns [Decode::Definition | Nil]
			def best(definitions)
				definitions.each do |definition|
					if definition.documentation
						return definition
					end
				end
				
				return definitions.first
			end
			
			# Given a lexical path, find the best definition for that path.
			# @returns [Tuple(Decode::Trie::Node, Decode::Definition)]
			def lookup(path)
				if node = @index.trie.lookup(path.map(&:to_sym))
					return node, best(node.values)
				end
			end
			
			def document_for(definition)
				document_path = File.join("lib", definition.lexical_path.map{|_| _.to_s.downcase}) + ".md"
				
				if File.exist?(document_path)
					document = self.document(File.read(document_path), definition)
					
					if document.first_child.type == :header
						document.first_child.delete
					end
					
					return document
				end
			end
			
			def linkify(text, definition, language: definition&.language)
				rewriter = Linkify.new(self, language, text)
				
				code = language.code_for(text, @index, relative_to: definition)
				
				code.extract(rewriter)
				
				return rewriter.apply
			end
			
			# Format the given text in the context of the given definition and language.
			# See {document} for details.
			# @returns [XRB::MarkupString]
			def format(text, definition = nil, language: definition&.language, **options)
				case text
				when Enumerable
					text = text.to_a.join("\n")
				when nil
					return nil
				end
				
				if document = self.document(text, definition, language: language)
					return XRB::MarkupString.raw(
						document.to_html(**options)
					)
				end
			end
			
			# Convert the given markdown text into HTML.
			#
			# Updates source code references (`{language identifier}`) into links.
			#
			# @returns [Document]
			def document(text, definition = nil, language: definition&.language)
				Document.new(text, self, definition: definition, default_language: language)
			end
			
			# Compute a unique string which can be used as `id` attribute in the HTML output.
			# @returns [String]
			def id_for(definition, suffix = nil)
				if suffix
					"#{definition.qualified_name}-#{suffix}"
				else
					definition.qualified_name
				end
			end
			
			# Compute a link href to the given definition for use within the HTML output.
			# @returns [XRB::Reference]
			def link_for(definition)
				path = definition.lexical_path.map{|entry| entry.to_s}
				
				if definition.container?
					return XRB::Reference.new(@source_path + path + "index")
				else
					name = path.pop
					return XRB::Reference.new(@source_path + path + "index", fragment: id_for(definition))
				end
			end
			
			# Enumerate over all available guides in order.
			# @yields {|guide| ...} If a block is given.
			# 	@parameter guide [Guide]
			# @returns [Enumerator(Guide)] If no block given.
			def guides
				return to_enum(:guides) unless block_given?
				
				@links.index("/guides").each do |link|
					guide_path = File.join(@root, link.path)
					
					next unless File.directory?(guide_path)
					
					yield Guide.new(self, guide_path)
				end
			end
			
			def readme_document
				if path = self.path_for('readme.md') || self.path_for('README.md')
					Document.new(File.read(path), self)
				end
			end
			
			def project_title
				readme_document&.title || "Project"
			end
		end
	end
end
