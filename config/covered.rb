# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

# Include exported tasks and controllers even when no test loads them.
def include_patterns
	super + ["bake/**/*.rb", "pages/**/*.rb"]
end
