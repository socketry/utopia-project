# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2026, by Samuel Williams.

require_relative "renderer"
require "xrb"

module Utopia
	module Project
		# Represents a Markdown document with optional source code cross-references.
		class Document
			# Initialize a document from Markdown text.
			# @parameter text [String] The Markdown source text.
			# @parameter base [Base | Nil] The project used to resolve source code references.
			# @parameter definition [Decode::Definition | Nil] The definition that provides the lexical context.
			# @parameter default_language [Decode::Language::Generic | Nil] The default language for source code references.
			def initialize(text, base = nil, definition: nil, default_language: nil)
				@text = text
				@base = base
				@index = base&.index
				
				@definition = definition
				@default_language = default_language
				
				@root = nil
			end
			
			# Parse and resolve the document root.
			# @returns [Markly::Node] The root document node.
			def root
				@root ||= resolve(Markly.parse(@text, extensions: [:table]))
			end
			
			# Extract the leading heading as the document title.
			# @returns [String | Nil] The title, if the document starts with a heading.
			def title
				child = self.root.first_child
				
				if child && child.type == :header
					return child.first_child.to_plaintext
				end
			end
			
			# Get the first node in the document.
			# @returns [Markly::Node | Nil] The first child node.
			def first_child
				self.root.first_child
			end
			
			# Remove a named section and yield its heading for replacement.
			# @parameter name [String] A fragment of the heading text to match.
			# @parameter children [Boolean] Whether to remove nested subsections too.
			# @yields {|header| ...} The matched heading node.
			# 	@parameter header [Markly::Node] The matched heading.
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
			
			# Render the document as Markdown.
			# @returns [String] The rendered Markdown.
			def to_markdown(**options)
				self.root.to_markdown(**options)
			end
			
			# Render a document node as HTML.
			# @parameter node [Markly::Node] The node to render.
			# @returns [XRB::MarkupString] The rendered HTML markup.
			def to_html(node = self.root, **options)
				renderer = Renderer.new(ids: true, flags: Markly::UNSAFE, **options)
				XRB::Markup.raw(renderer.render(node))
			end
			
			# Wrap a node in a paragraph.
			# @parameter child [Markly::Node] The node to wrap.
			# @returns [Markly::Node] The paragraph node.
			def paragraph_node(child)
				node = Markly::Node.new(:paragraph)
				node.append_child(child)
				return node
			end
			
			# Build an HTML block node.
			# @parameter content [String] The raw HTML content.
			# @parameter type [Symbol] The node type retained for compatibility.
			# @returns [Markly::Node] The HTML node.
			def html_node(content, type = :html)
				node = Markly::Node.new(:html)
				node.string_content = content
				return node
			end
			
			# Build an inline HTML node.
			# @parameter content [String] The raw HTML content.
			# @returns [Markly::Node] The inline HTML node.
			def inline_html_node(content)
				node = Markly::Node.new(:inline_html)
				node.string_content = content
				return node
			end
			
			# Build a text node.
			# @parameter content [String] The text content.
			# @returns [Markly::Node] The text node.
			def text_node(content)
				node = Markly::Node.new(:text)
				node.string_content = content
				return node
			end
			
			# Build a link node around a child node.
			# @parameter title [String | Nil] The link title.
			# @parameter url [String | XRB::Reference] The link target.
			# @parameter child [Markly::Node] The linked child node.
			# @returns [Markly::Node] The link node.
			def link_node(title, url, child)
				node = Markly::Node.new(:link)
				node.title = title
				node.url = url.to_s
				
				node.append_child(child)
				
				return node
			end
			
			# Build an inline code node.
			# @parameter content [String] The code content.
			# @parameter language [String | Nil] The source language name.
			# @returns [Markly::Node] The code node.
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
