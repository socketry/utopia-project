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
require 'kramdown'

module Utopia
	module Project
		class Example
			# Initialize the example with the given root path.
			# @param base [Base] The base instance for the project.
			# @param root [String] The file-system path to the root of the example.
			def initialize(base, root)
				@base = base
				@root = root
				
				@documentation = nil
			end
			
			# The base instance of the project this example is loaded from.
			attr :base
			
			# The file-system path to the root of the project.
			attr :root
			
			def name
				File.basename(@root)
			end
			
			def title
				Trenni::Strings.to_title(self.name)
			end
			
			def href
				"/examples/#{self.name}/index"
			end
			
			def documentation
				@documentation ||= self.best_documentation
			end
			
			def files
				Dir.glob(File.expand_path("*", @root))
			end
			
			def sources
				return to_enum(:sources) unless block_given?
				
				files.each do |path|
					if source = Decode::Source.for?(path)
						yield source
					end
				end
			end
			
			private
			
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
