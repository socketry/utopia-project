# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2026, by Samuel Williams.

source "https://rubygems.org"

# Specify your gem's dependencies in utopia-project.gemspec
gemspec

group :maintenance, optional: true do
	gem "bake-gem"
	gem "bake-modernize"
	gem "bake-releases"
	
	gem "agent-context"
	gem "decode"
end

group :test do
	gem "sus"
	gem "sus-fixtures-protocol-http", "~> 0.1"
	gem "covered"
	
	gem "rubocop"
	gem "rubocop-md"
	gem "rubocop-socketry"
	
	gem "bake-test"
end
