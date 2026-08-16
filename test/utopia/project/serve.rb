# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2026, by Samuel Williams.

require "utopia/project"

require "protocol/http/middleware/builder"
require "sus/fixtures/protocol/http/middleware_context"

describe Utopia::Project do
	include Sus::Fixtures::Protocol::HTTP::MiddlewareContext
	
	let(:template_root) {File.expand_path("../../../template", __dir__)}
	
	let(:configuration_path) {File.expand_path("config/serve.rb", template_root)}
	
	let(:middleware) do
		Protocol::HTTP::Middleware.load(configuration_path)
	end
	
	it "redirects the root path to the index" do
		response = client.get("/")
		
		expect(response.status).to be == 301
		expect(response.headers["location"]).to be == "/index"
	end
	
	it "redirects directory paths to their index" do
		response = client.get("/guides/")
		
		expect(response.status).to be == 307
		expect(response.headers["location"]).to be == "/guides/index"
	end
	
	it "renders error documents with the original status" do
		response = client.get("/missing")
		
		expect(response.status).to be == 404
		expect(response.read).to be(:include?, "File Not Found")
	end
	
	it "has index page" do
		body = client.get("/index").read
		
		expect(body).to be(:include?, "Project")
		expect(body).to be(:include?, '<a href="/reference/index" class="" aria-current="false">Reference</a>')
	end
	
	it "generates URL-like import map values" do
		body = client.get("/index").read
		
		expect(body).to be(:include?, '"mermaid":"./_components/mermaid/mermaid.esm.min.mjs"')
		expect(body).to be(:include?, '"@socketry/syntax":"./_components/@socketry/syntax/Syntax.js"')
	end
	
	it "has guide page" do
		expect(client.get("/guides/getting-started/index").read).to be(:include?, "Getting Started")
	end
	
	it "has guide navigation" do
		body = client.get("/guides/documentation-guidelines/index").read
		
		expect(body).to be(:include?, 'href="/guides/getting-started/index"')
		expect(body).to be(:include?, 'href="/guides/mermaid-diagrams/index"')
		expect(body).not.to be(:include?, 'class="previous"')
		expect(body).not.to be(:include?, 'class="next"')
	end
	
	it "has reference index" do
		body = client.get("/reference/index").read
		
		expect(body).to be(:include?, "module Utopia")
		expect(body).to be(:include?, '<a href="/reference/Utopia/Project/ReleasesDocument/index">class ReleasesDocument</a> &lt; <a href="/reference/Utopia/Project/Document/index" title="Utopia::Project::Document">Document</a>')
		expect(body).to be(:include?, '<a href="/reference/Utopia/Project/Linkify/index">class Linkify</a> &lt; Decode::Syntax::Rewriter')
	end
	
	it "has reference file" do
		body = client.get("/reference/Utopia/Project/ReleasesDocument/index").read
		
		expect(body).to be(:include?, "def release_names")
		expect(body).to be(:include?, 'class ReleasesDocument &lt; <a href="/reference/Utopia/Project/Document/index" title="Utopia::Project::Document">Document</a>')
		expect(body).to be(:include?, '<dl class="relationships" data-pagefind-ignore>')
		expect(body).to be(:include?, "<dt>Inherits from</dt>")
		
		relationships = body[/<dl class="relationships" data-pagefind-ignore>.*?<\/dl>/m]
		expect(relationships).to be(:include?, "/reference/Utopia/Project/Document/index#Utopia%3A%3AProject%3A%3ADocument%23root")
		expect(relationships).to be(:include?, "<code>: <a href=")
		expect(body).not.to be(:include?, "<h2>Inherited Methods</h2>")
	end
	
	it "summarizes nested definitions" do
		body = client.get("/reference/Utopia/Project/index").read
		
		expect(body).to be(:include?, "Classes and Modules")
		expect(body).to be(:include?, '<dl class="nested-definitions">')
		expect(body).to be(:include?, '<a href="/reference/Utopia/Project/Document/index">class Document</a>')
		expect(body).to be(:include?, "Represents a Markdown document with optional source code cross-references.")
	end
end
