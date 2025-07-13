# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2023, by Samuel Williams.

require "utopia/project"

describe Utopia::Project do
	it "has a version number" do
		expect(Utopia::Project::VERSION).to be =~ /\d+\.\d+\.\d+/
	end
end
