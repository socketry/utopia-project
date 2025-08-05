# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

require "utopia/project"

describe Utopia::Project::Document do
	let(:readme_path) {File.expand_path("../../../readme.md", __dir__)}
	let(:document) {subject.new(File.read(readme_path))}
	
	let(:html) {document.to_html}
	
	it "generates title" do
		expect(html).to be(:include?, "<section id=\"utopia::project\"><h1>Utopia::Project</h1>")
	end
	
	it "can replace usage" do
		document.replace_section("Usage") do |header|
			header.insert_after(document.html_node("<content:usage/>"))
		end
		
		expect(html).to be(:include?, "<content:usage/>")
	end
end
