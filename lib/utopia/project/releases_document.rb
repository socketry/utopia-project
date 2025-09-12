# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2024-2025, by Samuel Williams.

require_relative "document"
require_relative "sidebar"

module Utopia
	module Project
		class ReleasesDocument < Document
			class Summary
				def initialize(node)
					@node = node
				end
				
				attr :node
				
				def id
					@node.to_plaintext.chomp.downcase.gsub(/\s+/, "-")
				end
				
				def to_markdown
					@node.dup.extract_children.to_markdown
				end
				
				def to_html
					@node.dup.extract_children.to_html
				end
			end
			
			class Release
				def initialize(node)
					@node = node
				end
				
				def notes
					node = @node.next
					
					notes = Markly::Node.new(:document)
					
					while node and node.type != :header
						notes.append_child(node.dup)
						
						node = node.next
					end
					
					return notes
				end
				
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
				
				def name
					@node.to_plaintext.chomp
				end
				
				def href(base = "/", anchor:)
					"#{base}releases/index##{anchor.downcase.gsub(/\s+/, "-")}"
				end
			end
			
			def release_names
				return to_enum(:release_names) unless block_given?
				
				self.root.each do |node|
					if node.type == :header and node.header_level == 2
						yield node.to_plaintext.chomp
					end
				end
			end
			
			def release(name)
				self.root.each do |node|
					if node.type == :header and node.header_level == 2 and node.to_plaintext.chomp == name
						return Release.new(node)
					end
				end
			end
			
			def latest_release
				if name = release_names.first
					release(name)
				end
			end
			
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
