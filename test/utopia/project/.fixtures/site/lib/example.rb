# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

# Example project namespace.
module Example
	# Adds instrumentation.
	module Logging
		# Record an event.
		def log
		end
	end
	
	# Adds metrics.
	module Metrics
		# Count requests.
		def count
		end
	end
	
	# Sends requests.
	class Client
		include Logging
		include Metrics
		
		# Send a request.
		# @parameter message [String] The request text.
		# @returns [String] The response.
		# @asynchronous
		# @example Send a message
		# 	Client.new.call("hello")
		# @example
		# 	Client.new.call("goodbye")
		def call(message)
			message
		end
	end
end
