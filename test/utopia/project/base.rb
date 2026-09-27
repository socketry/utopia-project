# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "utopia/project/site"

describe Utopia::Project::Base do
	include Utopia::Project::SiteContext
	
	it "loads supplemental documentation from the project root" do
		_, definition = base.lookup(%w[Example Client])
		document = base.document_for(definition)
		
		expect(document).not.to be_nil
		expect(document.to_html).to be(:include?, "Supplemental documentation")
		expect(document.to_html).not.to be(:include?, "Client Details")
	end
	
	it "handles empty supplemental documents" do
		write("lib/example/client.md", "")
		_, definition = base.lookup(%w[Example Client])
		
		expect(base.document_for(definition).to_html.to_s).to be == ""
	end
	
	it "accepts absent and enumerable documentation" do
		expect(base.document(nil)).to be_nil
		expect(base.format(nil)).to be_nil
		expect(base.document(["First paragraph.", "", "Second paragraph."]).to_html).to be(:include?, "<p>Second paragraph.</p>")
	end
	
	it "gives alternative definitions distinct identifiers" do
		_, definition = base.lookup(%w[Example Client])
		expect(base.id_for(definition, "alternate")).to be == "Example::Client-alternate"
	end
	
	it "uses source metadata and falls back to the homepage or no source link" do
		expect(base.source_code_uri).to be == "https://github.com/example/project"
		base.gemspec.metadata.delete("source_code_uri")
		expect(base.source_code_uri).to be == "https://example.com/project/"
		base.gemspec.homepage = nil
		expect(base.source_code_uri).to be_nil
	end
end
