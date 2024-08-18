# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2022, by Samuel Williams.

prepend Actions

on '**' do
	@base = Utopia::Project::Base.instance
end

on 'index' do
	if @document = @base.readme_document
		@document.replace_section("Usage") do |header|
			header.insert_after(@document.html_node("<content:usage/>"))
		end
		
		@document.replace_section("Releases", children: true) do |header|
			header.insert_after(@document.html_node("<content:releases/>"))
		end
	end
end
