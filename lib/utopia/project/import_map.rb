# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2025-2026, by Samuel Williams.

require "utopia/import_map"

module Utopia
	module Project
		IMPORT_MAP = Utopia::ImportMap.load_manifest(
			File.expand_path("../../../public/_components", __dir__)
		)
	end
end
