# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2023, by Samuel Williams.

require 'utopia/project/changes_document'

describe Utopia::Project::ChangesDocument do
	let(:changes_path) {File.expand_path("../../../changes.md", __dir__)}
	let(:document) {subject.new(File.read(changes_path))}
	
	let(:html) {document.to_html}
	
	it "generates title" do
		expect(html).to be(:include?, "<h1>v0.28.0</h1>")
	end
	
	it "can extract release names" do
		names = document.release_names.to_a
		
		expect(names).to be(:include?, "v0.28.0")
	end
end