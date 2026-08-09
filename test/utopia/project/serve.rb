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
	
	it "has root page" do
		expect(client.get("/index").read).to be(:include?, "Project")
	end
	
	it "has guide page" do
		expect(client.get("/guides/getting-started/index").read).to be(:include?, "Getting Started")
	end
	
	it "has source code index" do
		expect(client.get("/source/index").read).to be(:include?, "module Utopia")
	end
	
	it "has source code file" do
		expect(client.get("/source/Utopia/Project/Base/index").read).to be(:include?, "def initialize")
	end
end
