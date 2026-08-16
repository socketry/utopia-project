# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

module Example
	module Included
		# An included method.
		def included_method
		end
		
		# An included method which is overridden by the child.
		def overridden_method
		end
		
		private
		
		# A private included method.
		def private_included_method
		end
	end
	
	module Prepended
		# A prepended method.
		def prepended_method
		end
	end
	
	module Extended
		# An extended method.
		def extended_method
		end
	end
	
	class Parent
		# Initialize the parent.
		def initialize
		end
		
		# An inherited instance method.
		def parent_method
		end
		
		# An inherited class method.
		def self.parent_class_method
		end
		
		class << self
			# An inherited singleton class method.
			def singleton_class_method
			end
		end
		
		private
		
		# A private parent method.
		def private_parent_method
		end
	end
	
	class Child < Parent
		include Included
		prepend Prepended
		extend Extended
		
		# Override the included method.
		def overridden_method
		end
	end
end
