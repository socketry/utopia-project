# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2026, by Samuel Williams.

require "utopia/project"

describe Utopia::Project::Document do
	let(:readme_path) {File.expand_path("../../../readme.md", __dir__)}
	let(:document) {subject.new(File.read(readme_path))}
	
	let(:html) {document.to_html}
	
	it "generates title" do
		expect(html).to be(:include?, "<section id=\"utopia::project\" data-pagefind-title=\"Utopia::Project\"><h1>Utopia::Project</h1>")
	end
	
	it "exposes heading titles to Pagefind" do
		document = subject.new("## Installation & Usage")
		html = document.to_html.to_s
		
		expect(html).to be(:include?, '<section id="installation-&amp;-usage" data-pagefind-title="Installation &amp; Usage">')
	end
	
	it "renders language-prefixed inline code" do
		root = File.expand_path("../../..", __dir__)
		base = Utopia::Project::Base.new(root)
		document = subject.new("Use ruby:`Object.new` to create an object.", base)
		html = document.to_html.to_s
		
		expect(html).to be(:include?, '<code class="language-ruby">Object.new</code>')
		expect(html).not.to be(:include?, "<a ")
		expect(document.to_markdown).to be == "Use ruby:`Object.new` to create an object.\n"
	end
	
	it "escapes language-prefixed inline code" do
		root = File.expand_path("../../..", __dir__)
		base = Utopia::Project::Base.new(root)
		document = subject.new("Compare ruby:`foo < bar`.", base)
		html = document.to_html.to_s
		
		expect(html).to be(:include?, '<code class="language-ruby">foo &lt; bar</code>')
	end
	
	it "resolves language-prefixed inline code references" do
		root = File.expand_path("../../..", __dir__)
		base = Utopia::Project::Base.new(root)
		base.update([File.join(root, "lib/utopia/project/document.rb")])
		
		document = subject.new("See ruby:`Utopia::Project::Document#root`.", base)
		html = document.to_html.to_s
		
		expect(html).to be(:include?, '<code class="language-ruby"><a href="/reference/Utopia/Project/Document/index#Utopia%3A%3AProject%3A%3ADocument%23root"')
		expect(html).to be(:include?, ">Utopia::Project::Document#root</a></code>")
	end
	
	it "continues to resolve legacy brace references" do
		root = File.expand_path("../../..", __dir__)
		base = Utopia::Project::Base.new(root)
		base.update([File.join(root, "lib/utopia/project/document.rb")])
		
		document = subject.new("See {ruby Utopia::Project::Document#root}.", base)
		html = document.to_html.to_s
		
		expect(html).to be(:include?, '<code class="language-ruby"><a href="/reference/Utopia/Project/Document/index#Utopia%3A%3AProject%3A%3ADocument%23root"')
		expect(html.scan("<a ").size).to be == 1
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
		expect(html).to be(:include?, '<section id="deployment" data-pagefind-title="Deployment">')
		
		# Second "Deployment" should have id="deployment-2"
		expect(html).to be(:include?, '<section id="deployment-2" data-pagefind-title="Deployment">')
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
