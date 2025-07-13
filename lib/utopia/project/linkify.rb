# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2024, by Samuel Williams.

require "decode/syntax/rewriter"

module Utopia
	module Project
		class Linkify < Decode::Syntax::Rewriter
			# @parameter base [Base] The base data.
			def initialize(base, language, text)
				@base = base
				@language = language
				
				super(text)
			end
			
			def text_for(range)
				text = super(range)
				
				return XRB::Strings.to_html(text)
			end
			
			def link_to(definition, text)
				XRB::Builder.fragment do |builder|
					builder.inline("a", href: @base.link_for(definition), title: definition.qualified_name) do
						builder.text(text)
					end
				end
			end
			
			def apply(output = XRB::Builder.new)
				output.inline("code", class: "language-#{@language.name}") do
					super
				end
				
				return output.to_str
			end
		end
	end
end
