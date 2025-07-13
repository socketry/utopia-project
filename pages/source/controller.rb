# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2024, by Samuel Williams.

prepend Actions

on "**/*/index" do |request, path|
	@lexical_path = path.components.dup
	# Remove the last "index" part:
	@lexical_path.pop
	
	@node, @symbol = @base.lookup(@lexical_path)
	
	unless @symbol
		fail! :not_found
	end
	
	path.components = ["show"]
end
