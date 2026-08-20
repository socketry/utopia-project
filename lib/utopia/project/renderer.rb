# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2022-2026, by Samuel Williams.

require "markly"
require "markly/renderer/html"

module Utopia
	module Project
		# Renders project Markdown with support for Mermaid code blocks.
		class Renderer < Markly::Renderer::HTML
			# Initialize the project renderer.
			# @parameter inline_code_resolver [Proc | Nil] Resolves language-prefixed inline code into an inline HTML node.
			def initialize(inline_code_resolver: nil, **options)
				@inline_code_resolver = inline_code_resolver
				
				super(**options)
			end
			
			# Render a heading and expose its title to Pagefind for sub-results.
			# @parameter node [Markly::Node] The heading node.
			def header(node)
				block do
					if @headings
						out("</section>") if @section
						@section = true
						out(
							"<section#{id_for(node)} data-pagefind-title=\"",
							escape_html(node.to_plaintext.chomp),
							"\">"
						)
					end
					
					out("<h", node.header_level, "#{source_position(node)}>", :children, "</h", node.header_level, ">")
				end
			end
			
			# Render a fenced code block, including Mermaid diagrams.
			# @parameter node [Markly::Node] The fenced code block node.
			def code_block(node)
				language, _ = node.fence_info.split(/\s+/, 2)
				
				if language == "mermaid"
					block do
						out(
							"<div#{source_position(node)} class=\"mermaid\">",
							escape_html(node.string_content),
							"</div>"
						)
					end
				else
					super
				end
			end
			
			# Render inline code, resolving language-prefixed references when possible.
			# @parameter node [Markly::Node] The inline code node.
			def code(node)
				if @inline_code_resolver && (language = node.code_language)
					out(@inline_code_resolver.call(node.string_content, language: language))
				else
					super
				end
			end
		end
	end
end
