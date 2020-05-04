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
require 'trenni/reference'
require 'decode'

require 'thread/local'

require 'kramdown'

module Utopia
	module Project
		# The base symbol table and project index.
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
			# @param root [String] The file-system path to the root of the project.
			def initialize(root = Dir.pwd)
				@root = root
				
				@source_path = Utopia::Path["/source"]
				
				@index = Decode::Index.new
			end
			
			# The file-system path to the root of the project.
			attr :root
			
			# The source code index which is used for generating pages.
			attr :index
			
			# Return the absolute path for the given file name, if it exists in the project.
			# @param file_name [String] The relative path to the project file, e.g. `README.md`.
			def path_for(file_name)
				full_path = File.expand_path(file_name, @root)
				if File.exist?(full_path)
					return full_path
				end
			end
			
			# Update the index with the specified paths.
			# @param paths [Array(String)] The paths to load and parse.
			def update(paths)
				@index.update(paths)
			end
			
			def best(symbols)
				symbols.each do |symbol|
					if symbol.documentation
						return symbol
					end
				end
				
				return symbols.first
			end
			
			def lookup(path)
				if node = @index.trie.lookup(path.map(&:to_sym))
					return node, best(node.values)
				end
			end
			
			def format(text, symbol = nil, language: symbol&.language)
				if text.is_a?(Enumerable)
					text = text.to_a.join("\n")
				end
				
				if language
					text = text&.gsub(/{(.*?)}/) do |match|
						reference = language.reference($1)
						
						if symbol = @index.lookup(reference, relative_to: symbol)&.first
							"<a href=\"#{link_for(symbol)}\"><code class=\"language-#{symbol.language.name}\">#{symbol.short_form}</code></a>"
						else
							"`#{$1}`"
						end
					end
				end
				
				return Trenni::MarkupString.raw(
					Kramdown::Document.new(text, syntax_highlighter: nil).to_html
				)
			end
			
			# Compute an HTML id for the given symbol.
			def id_for(symbol)
				symbol.qualified_name
			end
			
			# Compute an HTML link to the given symbol.
			def link_for(symbol)
				path = symbol.lexical_path.map{|entry| entry.to_s}
				
				if symbol.container?
					return Trenni::Reference.new(@source_path + path + "index")
				else
					name = path.pop
					return Trenni::Reference.new(@source_path + path + "index", fragment: id_for(symbol))
				end
			end
		end
	end
end
