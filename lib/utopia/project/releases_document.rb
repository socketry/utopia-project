# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2024-2025, by Samuel Williams.

require_relative "document"
require_relative "sidebar"

module Utopia
	module Project
		# Represents project release notes organized by release headings.
		class ReleasesDocument < Document
			# Represents a section within a release.
			class Summary
				# Initialize a release section summary.
				# @parameter node [Markly::Node] The section heading node.
				def initialize(node)
					@node = node
				end
				
				# The section heading node.
				# @attribute [Markly::Node]
				attr :node
				
				# Generate the section identifier.
				# @returns [String] The normalized section identifier.
				def id
					@node.to_plaintext.chomp.downcase.gsub(/\s+/, "-")
				end
				
				# Render the section heading contents as Markdown.
				# @returns [String] The rendered Markdown.
				def to_markdown
					@node.dup.extract_children.to_markdown
				end
				
				# Render the section heading contents as HTML.
				# @returns [String] The rendered HTML.
				def to_html
					@node.dup.extract_children.to_html
				end
			end
			
			# Represents a single release and its notes.
			class Release
				# Initialize a release from its heading node.
				# @parameter node [Markly::Node] The release heading node.
				def initialize(node)
					@node = node
				end
				
				# Extract the introductory notes for the release.
				# @returns [Markly::Node] A document containing the release notes.
				def notes
					node = @node.next
					
					notes = Markly::Node.new(:document)
					
					while node and node.type != :header
						notes.append_child(node.dup)
						
						node = node.next
					end
					
					return notes
				end
				
				# Enumerate the change sections for the release.
				# @yields {|summary| ...} If a block is given.
				# 	@parameter summary [Summary] A change section.
				# @returns [Enumerator(Summary)] If no block is given.
				def changes
					return to_enum(:changes) unless block_given?
					
					node = @node.next
					
					while node
						if node.type == :header
							if node.header_level <= @node.header_level
								break
							end
							
							if node.header_level == @node.header_level + 1
								yield Summary.new(node)
							end
						end
						
						node = node.next
					end
				end
				
				# Get the release name from its heading.
				# @returns [String] The release name.
				def name
					@node.to_plaintext.chomp
				end
				
				# Build a link to a section within the release.
				# @parameter base [String] The base URL path.
				# @parameter anchor [String] The section anchor.
				# @returns [String] The release section URL.
				def href(base = "/", anchor:)
					"#{base}releases/index##{anchor.downcase.gsub(/\s+/, "-")}"
				end
			end
			
			# Enumerate release names in document order.
			# @yields {|name| ...} If a block is given.
			# 	@parameter name [String] A release name.
			# @returns [Enumerator(String)] If no block is given.
			def release_names
				return to_enum(:release_names) unless block_given?
				
				self.root.each do |node|
					if node.type == :header and node.header_level == 2
						yield node.to_plaintext.chomp
					end
				end
			end
			
			# Find a release by name.
			# @parameter name [String] The release name.
			# @returns [Release | Nil] The matching release.
			def release(name)
				self.root.each do |node|
					if node.type == :header and node.header_level == 2 and node.to_plaintext.chomp == name
						return Release.new(node)
					end
				end
			end
			
			# Get the first release in the document.
			# @returns [Release | Nil] The latest release.
			def latest_release
				if name = release_names.first
					release(name)
				end
			end
			
			# Enumerate releases in document order.
			# @yields {|release| ...} If a block is given.
			# 	@parameter release [Release] A release.
			# @returns [Enumerator(Release)] If no block is given.
			def releases
				return to_enum(:releases) unless block_given?
				
				release_names.each do |name|
					yield release(name)
				end
			end
			
			# Generate a navigation from the releases.
			# @returns [Sidebar]
			def navigation
				@navigation ||= begin
					entries = release_names.map do |name|
						anchor = name.downcase.gsub(/\s+/, "-")
						Sidebar::Entry.new(name, 2, anchor)
					end
					
					Sidebar.new(entries)
				end
			end
		end
	end
end
