# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2025, by Samuel Williams.

require_relative "guide"

module Utopia
	module Project
		# A collection of guides with navigation and lookup capabilities.
		class Guides
			include Enumerable
			
			# Initialize the guides collection.
			# @parameter base [Base] The base instance for the project.
			# @parameter links [Object] The links index for finding guides.
			def initialize(base, links)
				@base = base
				@links = links
			end
			
			# Iterate over all guides.
			# @yields {|guide| ...} If a block is given.
			# 	@parameter guide [Guide]
			# @returns [Enumerator(Guide)] If no block is given.
			def each(&block)
				return to_enum(:each) unless block_given?
				
				@links.index("/guides").each do |link|
					guide_path = File.join(@base.root, link.path)
					
					next unless File.directory?(guide_path)
					
					yield Guide.new(@base, guide_path, link.info)
				end
			end
			
			# Get all guides as a sorted array.
			# @returns [Array(Guide)]
			def to_a
				@array ||= super.sort
			end
			
			# Find a guide by name.
			# @parameter name [String] The guide name.
			# @returns [Guide | Nil]
			def [](name)
				to_a.find { |guide| guide.name == name }
			end
			
			# Get the related guides (previous and next) for the given guide.
			# @parameter guide [Guide] The current guide.
			# @returns [Array(Guide | Nil, Guide | Nil)] A two-element array containing the previous and next guides.
			def related(guide)
				index = to_a.index { |g| g.name == guide.name }
				return [nil, nil] unless index
				
				previous_guide = index > 0 ? to_a[index - 1] : nil
				next_guide = index < to_a.size - 1 ? to_a[index + 1] : nil
				
				[previous_guide, next_guide]
			end
		end
	end
end

