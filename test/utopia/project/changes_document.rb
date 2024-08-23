# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2023, by Samuel Williams.

require 'utopia/project/releases_document'

describe Utopia::Project::ReleasesDocument do
	let(:releases_path) {File.expand_path("../../../releases.md", __dir__)}
	let(:document) {subject.new(File.read(releases_path))}
	
	let(:html) {document.to_html}
	
	it "generates title" do
		expect(html).to be(:include?, "<h2>v0.28.0</h2>")
	end
	
	it "can extract release names" do
		names = document.release_names.to_a
		
		expect(names).to be(:include?, "v0.28.0")
	end
end
