# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2024, by Samuel Williams.

require_relative 'renderer'
require 'xrb'

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
			
			def title
				child = self.root.first_child
				
				if child && child.type == :header
					return child.first_child.to_plaintext
				end
			end
			
			def first_child
				self.root.first_child
			end
			
			def replace_section(name, children: false)
				child = self.first_child
				
				while child
					if child.type == :header
						header = child
						
						# We found the matched header:
						if header.first_child.to_plaintext.include?(name)
							# Now subsequent children:
							current = header.next
							
							# Delete everything in the section until we encounter another header:
							while current
								if current.type == :header
									# If we are removing all children, keep on going until we reach a header of the same level or higher:
									if children
										break if current.header_level <= header.header_level
									else
										break
									end
								end
								
								current_next = current.next
								current.delete
								current = current_next
							end
							
							return yield(header)
						end
					end
					
					child = child.next
				end
			end
			
			def to_markdown(**options)
				self.root.to_markdown(**options)
			end
			
			def to_html(node = self.root, **options)
				renderer = Renderer.new(ids: true, flags: Markly::UNSAFE, **options)
				XRB::Markup.raw(renderer.render(node))
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
						"<code class=\"language-#{language}\">#{XRB::Strings.to_html(content)}</code>"
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
