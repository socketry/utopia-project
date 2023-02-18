# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2023, by Samuel Williams.

require 'utopia/project'
require 'rack/test'

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
end
