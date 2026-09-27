# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2026, by Samuel Williams.

prepend Actions

on "**/*/index" do |request, path|
	@lexical_path = path.components.dup
	# Remove the last "index" part:
	@lexical_path.pop
	
	@node, @symbol = @base.lookup(@lexical_path)
	
	unless @symbol
		respond! Utopia::Response[404]
	end
	
	path.components = ["show"]
end
