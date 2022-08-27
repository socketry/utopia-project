# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020, by Samuel Williams.

require 'utopia/project'

RSpec.describe Utopia::Project do
	it "has a version number" do
		expect(Utopia::Project::VERSION).not_to be nil
	end
end
