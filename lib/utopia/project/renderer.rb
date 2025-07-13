# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2022, by Samuel Williams.

require "markly"
require "markly/renderer/html"

module Utopia
	module Project
		class Renderer < Markly::Renderer::HTML
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
		end
	end
end
