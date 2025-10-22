# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

require "utopia/project"

require "rack/builder"
require "rack/test"

describe Utopia::Project do
	include Rack::Test::Methods
	
	let(:template_root) {File.expand_path("../../../template", __dir__)}
	
	let(:rackup_path) {File.expand_path("config.ru", template_root)}
	let(:rackup_directory) {File.dirname(rackup_path)}
	
	let(:app) {Rack::Builder.parse_file(rackup_path)}
	
	it "has root page" do
		get "/index"
		
		expect(last_response.body).to be(:include?, "Project")
	end
	
	it "has guide page" do
		get "/guides/getting-started/index"
		
		expect(last_response.body).to be(:include?, "Getting Started")
	end
	
	it "has source code index" do
		get "/source/index"
		
		expect(last_response.body).to be(:include?, "module Utopia")
	end
	
	it "has source code file" do
		get "/source/Utopia/Project/Base/index"
		
		expect(last_response.body).to be(:include?, "def initialize")
	end
end
