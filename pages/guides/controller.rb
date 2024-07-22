# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2023, by Samuel Williams.

prepend Actions

on '**/*/index' do |request, path|
	name = path.components[-2]
	
	@guide = @base.guides.find do |guide|
		guide.name == name
	end
	
	path.components = ["show"]
end
