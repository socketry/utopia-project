# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2024, by Samuel Williams.

source "https://rubygems.org"

# Specify your gem's dependencies in utopia-project.gemspec
gemspec

group :maintenance, optional: true do
	gem "bake-gem"
	gem "bake-modernize"
end

group :test do
	gem "sus"
	gem "covered"
	
	gem "rack-test"
	
	gem "bake-test"
end
