# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

# Build a client-side search index using Pagefind.
#
# Pagefind is downloaded automatically via `npx` if not already installed.
# The index is generated from the rendered HTML in the output directory and
# written to `<output_path>/pagefind/`.
#
# @parameter output_path [String] The path to the static site output.
def build(output_path: "docs")
	unless system("npx", "--yes", "pagefind@1.5.2", "--site", output_path)
		raise "Pagefind index build failed!"
	end
end
