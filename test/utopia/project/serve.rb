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
		expect(client.get("/index").read).to be(:include?, "Project")
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
		
		expect(body).to be(:include?, 'href="/guides/getting-started/index" class="previous"')
		expect(body).to be(:include?, 'href="/guides/mermaid-diagrams/index" class="next"')
	end
	
	it "has source code index" do
		expect(client.get("/source/index").read).to be(:include?, "module Utopia")
	end
	
	it "has source code file" do
		expect(client.get("/source/Utopia/Project/Base/index").read).to be(:include?, "def initialize")
	end
end
