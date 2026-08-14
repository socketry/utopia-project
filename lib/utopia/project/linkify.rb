# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

require "decode/syntax/rewriter"

module Utopia
	module Project
		# Rewrites source code as HTML with links to indexed definitions.
		class Linkify < Decode::Syntax::Rewriter
			# Initialize a source code rewriter.
			# @parameter base [Base] The base data.
			# @parameter language [Decode::Language::Generic] The source language.
			# @parameter text [String] The source text to rewrite.
			def initialize(base, language, text)
				@base = base
				@language = language
				
				super(text)
			end
			
			# Escape an unmatched range of source text for HTML output.
			# @parameter range [Range] The source text range.
			# @returns [String] The escaped text.
			def text_for(range)
				text = super(range)
				
				return XRB::Strings.to_html(text)
			end
			
			# Build a link to an indexed definition.
			# @parameter definition [Decode::Definition] The linked definition.
			# @parameter text [String] The visible link text.
			# @returns [XRB::MarkupString] The link markup.
			def link_to(definition, text)
				XRB::Builder.fragment do |builder|
					builder.inline("a", href: @base.link_for(definition), title: definition.qualified_name) do
						builder.text(text)
					end
				end
			end
			
			# Apply the source links and wrap the result in a code element.
			# @parameter output [XRB::Builder] The output builder.
			# @returns [String] The generated HTML markup.
			def apply(output = XRB::Builder.new)
				output.inline("code", class: "language-#{@language.name}") do
					super
				end
				
				return output.to_str
			end
		end
	end
end
