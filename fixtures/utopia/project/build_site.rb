# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "bake/context"
require "fileutils"

root = File.expand_path("../../../test/utopia/project/.fixtures/site", __dir__)
output = File.expand_path("../../../test/browser/.site", __dir__)

Dir.chdir(root) do
	Bake::Context.load(root)["utopia:project:static"].call(output_path: output)
end
