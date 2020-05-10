# frozen_string_literal: true

# Copyright, 2020, by Samuel G. D. Williams. <http://www.codeotaku.com>
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

require 'utopia/path'
require 'utopia/content/links'

require 'trenni/reference'
require 'decode'

require 'thread/local'

require 'kramdown'

require_relative 'guide'

module Utopia
	module Project
		# Provides structured access to a project directory which contains source code and guides.
		class Base
			extend Thread::Local
			
			def self.local
				instance = self.new
				
				source_files = Dir.glob(
					File.expand_path("lib/**/*.rb", instance.root)
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
			# @parameter file_name [String] The relative path to the project file, e.g. `README.md`.
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
			
			# Format the given text in the context of the given definition and language.
			# See {document} for details.
			# @returns [Trenni::MarkupString]
			def format(text, definition = nil, language: definition&.language)
				case text
				when Enumerable
					text = text.to_a.join("\n")
				when nil
					return nil
				end
				
				if document = self.document(text, definition, language: language)
					return Trenni::MarkupString.raw(
						document.to_html
					)
				end
			end
			
			# Convert the given markdown text into HTML.
			#
			# - Updates source code references (`{language identifier}`) into links.
			# - Uses {Kramdown} to convert the text into HTML.
			#
			# @returns [Kramdown::Document]
			def document(text, definition = nil, language: definition&.language)
				text = text&.gsub(/(?<!`){(.*?)}/) do |match|
					linkify($1, definition, language: language)
				end
				
				return Kramdown::Document.new(text, syntax_highlighter: nil)
			end
			
			# Replace source code references in the given text with HTML anchors.
			#
			# @returns [Trenni::Builder]
			def linkify(text, definition = nil, language: definition&.language)
				reference = @index.languages.parse_reference(text, default_language: language)
				
				Trenni::Builder.fragment do |builder|
					if reference and definition = @index.lookup(reference, relative_to: definition)&.first
						builder.inline('a', href: link_for(definition)) do
							builder.inline('code', class: "language-#{definition.language.name}") do
								builder.text definition.qualified_form
							end
						end
					elsif reference
						builder.inline('code', class: "language-#{reference.language.name}") do
							builder.text text
						end
					else
						builder.inline('code') do
							builder.text text
						end
					end
				end
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
			# @returns [Trenni::Reference]
			def link_for(definition)
				path = definition.lexical_path.map{|entry| entry.to_s}
				
				if definition.container?
					return Trenni::Reference.new(@source_path + path + "index")
				else
					name = path.pop
					return Trenni::Reference.new(@source_path + path + "index", fragment: id_for(definition))
				end
			end
			
			# Enumerate over all available guides in order.
			# @block {|guide| ... }
			# @yield guide [Guide]
			# @returns [Enumerator(Guide)]
			def guides
				return to_enum(:guides) unless block_given?
				
				@links.index("/guides").each do |link|
					guide_path = File.join(@root, link.path)
					
					next unless File.directory?(guide_path)
					
					yield Guide.new(self, guide_path)
				end
			end
		end
	end
end
