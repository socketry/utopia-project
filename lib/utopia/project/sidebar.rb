# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

module Utopia
	module Project
		# Generates a sidebar navigation from markdown document headings.
		class Sidebar
			# Represents a sidebar navigation entry with title, level, and anchor.
			class Entry
				def initialize(title, level, anchor)
					@title = title
					@level = level
					@anchor = anchor
				end
				
				# The text content of the heading.
				# @attribute [String]
				attr :title
				
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
											builder.text entry.title
										end
									end
								else
									builder.tag :li do
										builder.tag :a, {href: "##{entry.anchor}"} do
											builder.text entry.title
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
						title = node.first_child&.to_plaintext
						level = node.header_level
						anchor = generate_anchor(title)
						
						# Only include H2 and below in sidebar (skip H1 main title)
						if title && !title.empty? && level >= 2
							headings << Entry.new(title, level, anchor)
						end
					end
				end
				
				headings
			end
			
			def self.generate_anchor(title)
				# Generate anchor ID exactly like Markly renderer does it
				title.downcase
					.gsub(/\s+/, '-')     # Replace spaces with hyphens
					.gsub('&', '&amp;')   # HTML encode ampersand
					.gsub('"', '&quot;')  # HTML encode quotes
					.gsub("'", '&#39;')   # HTML encode single quotes
					.gsub('<', '&lt;')    # HTML encode less than
					.gsub('>', '&gt;')    # HTML encode greater than
			end
			
		end
	end
end
