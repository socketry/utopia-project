#!/usr/bin/env -S falcon host
# frozen_string_literal: true

require "falcon/environment/application"
require "utopia/application"

service File.basename(__dir__) do
	include Falcon::Environment::Application
	
	def middleware
		Utopia::Application.load("config/application.rb")
	end
end
