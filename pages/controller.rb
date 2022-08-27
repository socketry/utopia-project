# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2022, by Samuel Williams.

prepend Actions

on 'index' do
	@base = Utopia::Project::Base.instance
	
	if @document = @base.readme_document
		
		@document.replace_section("Usage") do |header|
			header.insert_after(@document.html_node("<content:usage/>"))
		end
	end
end
