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
	
	it "generates unique IDs for duplicate headings" do
		markdown = <<~MARKDOWN
			## Kubernetes
			
			### Deployment
			
			Some content about Kubernetes deployment.
			
			## Systemd
			
			### Deployment
			
			Some content about Systemd deployment.
		MARKDOWN
		
		doc = subject.new(markdown)
		html = doc.to_html.to_s
		
		# First "Deployment" should have id="deployment"
		expect(html).to be(:include?, '<section id="deployment">')
		
		# Second "Deployment" should have id="deployment-2"
		expect(html).to be(:include?, '<section id="deployment-2">')
	end
	
	it "generates matching IDs in sidebar and document" do
		markdown = <<~MARKDOWN
			## Kubernetes
			
			### Deployment
			
			Some content about Kubernetes deployment.
			
			## Systemd
			
			### Deployment
			
			Some content about Systemd deployment.
		MARKDOWN
		
		doc = subject.new(markdown)
		sidebar = Utopia::Project::Sidebar.build(doc)
		html = doc.to_html.to_s
		
		# Check that sidebar anchors match the IDs in the HTML
		expect(sidebar.entries.size).to be == 4
		expect(sidebar.entries[0].anchor).to be == "kubernetes"
		expect(sidebar.entries[1].anchor).to be == "deployment"
		expect(sidebar.entries[2].anchor).to be == "systemd"
		expect(sidebar.entries[3].anchor).to be == "deployment-2"
		
		# Verify all sidebar anchors have corresponding sections in HTML
		sidebar.entries.each do |entry|
			expect(html).to be(:include?, %{id="#{entry.anchor}"})
		end
	end
end
