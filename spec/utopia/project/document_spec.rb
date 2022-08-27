# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2022, by Samuel Williams.

require 'utopia/project'
require 'rack/test'

RSpec.describe Utopia::Project::Document do
	let(:readme_path) {File.expand_path("../../../readme.md", __dir__)}
	subject {described_class.new(File.read(readme_path))}
	
	let(:html) {subject.to_html}
	
	it "generates title" do
		expect(html).to include("<section id=\"utopia::project\"><h1>Utopia::Project</h1>")
	end
	
	it "can replace usage" do
		subject.replace_section("Usage") do |header|
			header.insert_after(subject.html_node("<content:usage/>"))
		end
		
		expect(html).to include("<content:usage/>")
	end
end
