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

require 'decode/syntax/rewriter'

module Utopia
	module Project
		class Linkify < Decode::Syntax::Rewriter
			# @parameter base [Foo | Base] The base data.
			def initialize(base, language, text)
				@base = base
				@language = language
				
				super(text)
			end
			
			def text_for(range)
				text = super(range)
				
				return Trenni::Strings.to_html(text)
			end
			
			def link_to(definition, text)
				Trenni::Builder.fragment do |builder|
					builder.inline('a', href: @base.link_for(definition)) do
						builder.text(definition.qualified_name)
					end
				end
			end
			
			def apply(output = Trenni::Builder.new)
				output.inline('code', class: "language-#{@language.name}") do
					super
				end
				
				return output.to_str
			end
		end
	end
end
