# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2024-2025, by Samuel Williams.

require "utopia/project/releases_document"

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

describe Utopia::Project::ReleasesDocument do
	it "finds releases and keeps nested change sections within their release" do
		document = subject.new("# Changes\n\n## v2.0\n\nNew release.\n\n### New Feature\n\n#### Details\n\nText.\n\n## v1.0\n\nOld release.\n")
		release = document.latest_release
		
		expect(release.name).to be == "v2.0"
		expect(release.notes.to_markdown).to be == "New release.\n"
		expect(release.changes.map(&:to_markdown)).to be == ["New Feature"]
		expect(release.changes.map(&:id)).to be == ["new-feature"]
		expect(document.release("missing")).to be_nil
		expect(document.releases.map(&:name)).to be == ["v2.0", "v1.0"]
	end
	
	it "handles empty release notes" do
		document = subject.new("# Changes")
		expect(document.latest_release).to be_nil
		expect(document.navigation.to_html.to_s).to be == ""
	end
end
