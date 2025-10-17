# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2025, by Samuel Williams.

require_relative "renderer"

module Utopia
	module Project
		# Generates a sidebar navigation from markdown document headings.
		class Sidebar
			
			# Represents a sidebar navigation entry with title, level, and anchor.
			class Entry
				def initialize(title_html, level, anchor)
					@title_html = title_html
					@level = level
					@anchor = anchor
				end
				
				# The HTML content of the heading.
				# @attribute [XRB::Markup]
				attr :title_html
				
				# The heading level (1-6).
				# @attribute [Integer]
				attr :level
				
				# The anchor ID for linking to this heading.
				# @attribute [String]
				attr :anchor
			end
			# Build a sidebar from a markdown document by extracting headings.
			# @parameter document [Document] The document to extract headings from
			# @returns [Sidebar]
			def self.build(document)
				entries = extract_headings_from_document(document)
				new(entries)
			end
			
			# Initialize with an array of entries.
			# @parameter entries [Array(Entry)] The navigation entries
			def initialize(entries)
				@entries = entries
			end
			
			# The navigation entries.
			# @attribute [Array(Entry)]
			attr :entries
			
			# Check if there are any navigation entries.
			# @returns [Boolean]
			def any?
				!entries.empty?
			end
			
			# Generate HTML markup for the sidebar navigation.
			# @parameter sidebar [Boolean] Whether this is rendered in a sidebar layout (unused, kept for compatibility)
			# @parameter title [String] The title for the navigation section
			# @returns [XRB::MarkupString]
			def to_html(sidebar: false, title: "Table of Contents")
				return XRB::Markup.raw("") unless any?
				
				XRB::Builder.fragment do |builder|
					builder.tag :nav do
						builder.tag :heading do
							builder.text title
						end
						builder.tag :ul do
							entries.each do |entry|
								if entry.level > 2
									builder.tag :li, {class: "level-#{entry.level}"} do
										builder.tag :a, {href: "##{entry.anchor}"} do
											builder << entry.title_html
										end
									end
								else
									builder.tag :li do
										builder.tag :a, {href: "##{entry.anchor}"} do
											builder << entry.title_html
										end
									end
								end
							end
						end
					end
				end
			end
			
			private
			
			def self.extract_headings_from_document(document)
				headings = []
				return headings unless document&.root
				
				document.root.walk do |node|
					if node.type == :header
						next if node.header_level < 2 or node.header_level > 3
						
						fragment = node.dup.extract_children
						
						title = XRB::Markup.raw(fragment.to_html)
						level = node.header_level
						anchor = Markly::Renderer::HTML.anchor_for(fragment)
						
						headings << Entry.new(title, level, anchor)
					end
				end
				
				headings
			end
		end
	end
end
