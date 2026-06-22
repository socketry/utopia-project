# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

require "utopia/project"

require "protocol/http/request"

describe Utopia::Project do
	let(:template_root) {File.expand_path("../../../template", __dir__)}
	
	let(:application_path) {File.expand_path("config/application.rb", template_root)}
	
	let(:app) do
		Utopia::Application.load(application_path)
	end
	
	def get(path)
		@app_response = app.call(Protocol::HTTP::Request["GET", path])
	end
	
	def body
		@app_response.read
	end
	
	it "has root page" do
		get "/index"
		
		expect(body).to be(:include?, "Project")
	end
	
	it "has guide page" do
		get "/guides/getting-started/index"
		
		expect(body).to be(:include?, "Getting Started")
	end
	
	it "has source code index" do
		get "/source/index"
		
		expect(body).to be(:include?, "module Utopia")
	end
	
	it "has source code file" do
		get "/source/Utopia/Project/Base/index"
		
		expect(body).to be(:include?, "def initialize")
	end
end
