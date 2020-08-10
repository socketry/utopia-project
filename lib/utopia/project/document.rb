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

require 'markly'

module Utopia
	module Project
		class Document
			def initialize(text, base = nil, definition: nil, default_language: nil)
				@text = text
				@base = base
				@index = base&.index
				
				@definition = definition
				@default_language = default_language
				
				@root = nil
			end
			
			def root
				@root ||= resolve(Markly.parse(@text, extensions: [:table]))
			end
			
			def first_child
				self.root.first_child
			end
			
			def replace_section(name)
				child = self.first_child
				
				while child
					if child.type == :header
						header = child
						
						# We found the matched header:
						if header.first_child.to_plaintext.include?(name)
							# Now subsequent children:
							current = header.next
							while current.type != :header and following = current.next
								current.delete
								current = following
							end
							
							return yield(header)
						end
					end
					
					child = child.next
				end
			end
			
			def to_html(node = self.root)
				renderer = Markly::HTMLRenderer.new(ids: true, flags: Markly::UNSAFE)
				Trenni::MarkupString.raw(renderer.render(node))
			end
			
			def paragraph_node(child)
				node = Markly::Node.new(:paragraph)
				node.append_child(child)
				return node
			end
			
			def html_node(content, type = :html)
				node = Markly::Node.new(:html)
				node.string_content = content
				return node
			end
			
			def inline_html_node(content)
				node = Markly::Node.new(:inline_html)
				node.string_content = content
				return node
			end
			
			def text_node(content)
				node = Markly::Node.new(:text)
				node.string_content = content
				return node
			end
			
			def link_node(title, url, child)
				node = Markly::Node.new(:link)
				node.title = title
				node.url = url.to_s
				
				node.append_child(child)
				
				return node
			end
			
			def code_node(content, language = nil)
				if language
					node = inline_html_node(
						"<code class=\"language-#{language}\">#{Trenni::Strings.to_html(content)}</code>"
					)
				else
					node = Markly::Node.new(:code)
					node.string_content = content
					return node
				end
				
				return node
			end
			
			private
			
			# Replace source code references in the given text with HTML anchors.
			#
			def reference_node(content)
				if reference = @index.languages.parse_reference(content, default_language: @default_language)
					definition = @index.lookup(reference, relative_to: @definition)
				end
				
				if definition
					link_node(reference.identifier, @base.link_for(definition),
						code_node(definition.qualified_form, reference.language.name)
					)
				elsif reference
					code_node(reference.identifier, reference.language.name)
				else
					code_node(content)
				end
			end
			
			def resolve(root)
				return root if @index.nil?
				
				root.walk do |node|
					if node.type == :text
						content = node.string_content
						offset = 0
						
						while match = content.match(/{(?<reference>.*?)}/, offset)
							a, b = match.offset(0)
							
							if a > offset
								node.insert_before(
									text_node(content[offset...a])
								)
							end
							
							node.insert_before(
								reference_node(match[:reference])
							)
							
							offset = b
						end
						
						if offset == content.bytesize
							node.delete
						else
							node.string_content = content[offset..-1]
						end
					end
				end
				
				return root
			end
		end
	end
end
