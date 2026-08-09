# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require_relative "environment"

require "utopia/project"

Application = Utopia::Application.build do |builder|
	Utopia::Project.call(builder)
end
