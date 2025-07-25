# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2024, by Samuel Williams.

require "utopia/path"
require "xrb/reference"
require "decode"

module Utopia
	module Project
		# Provides structured access to a directory which contains documentation and source code to explain a specific process.
		class Guide
			# Initialize the example with the given root path.
			# @parameter base [Base] The base instance for the project.
			# @parameter root [String] The file-system path to the root of the example.
			def initialize(base, root)
				@base = base
				@root = root
				
				@documentation = nil
				
				@document = nil
				@title = nil
				@description = nil
				
				self.document
			end
			
			# The description from the first paragraph in the README.
			# @attribute [String | Nil]
			attr :description
			
			README = "readme.md"
			
			# The path to the README file for the guide.
			# @returns [String] The file-system path.
			def readme_path
				Dir[File.expand_path(README, @root)].first
			end
			
			# Does a README file exist for this guide?
			# @returns [Boolean]
			def readme?
				!readme_path.nil?
			end
			
			# The document for the README, if one exists.
			def document
				if self.readme?
					@document ||= self.readme_document.tap do |document|
						child = document.first_child
						
						if child&.type == :header
							@title = child.first_child.string_content
							
							@description = child.next
							child.delete
						end
					end
				end
			end
			
			# The base instance of the project this example is loaded from.
			# @attribute [Base]
			attr :base
			
			# The file-system path to the root of the project.
			# @attribute [String]
			attr :root
			
			# The name of the guide.
			# @returns [String]
			def name
				File.basename(@root)
			end
			
			# The title of the guide.
			# @returns [String]
			def title
				@title || XRB::Strings.to_title(self.name)
			end
			
			# The hypertext reference to this guide.
			# @returns [String]
			def href(base = "/")
				"#{base}guides/#{self.name}/index"
			end
			
			# The best documentation, extracted from the source files of the guide.
			# @returns [Decode::Documentation]
			def documentation
				@documentation ||= self.best_documentation
			end
			
			# All files associated with this guide.
			# @returns [Array(String)] The file-system paths.
			def files
				Dir.glob(File.expand_path("*", @root))
			end
			
			# All the source files associated with this guide.
			# @yields {|source| ...} If a block is given.
			# 	@parameter source [Decode::Source]
			# @returns [Enumerator(Decode::Source)] If no block is given.
			def sources
				return to_enum(:sources) unless block_given?
				
				files.each do |path|
					if source = @base.index.languages.source_for(path)
						yield source
					end
				end
			end
			
			private
			
			def readme_document
				content = File.read(self.readme_path)
				
				return @base.document(content)
			end
			
			def best_documentation
				if source = sources.first
					if segment = source.segments.first
						return segment.documentation
					end
				end
			end
		end
	end
end
