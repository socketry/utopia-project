# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

NPX = ENV["NPX"] || "npx"

# Build a client-side search index using Pagefind.
#
# Pagefind is downloaded automatically using the configured package runner if
# not already installed.
# The index is generated from the rendered HTML in the output directory and
# written to `<output_path>/pagefind/`.
#
# @parameter output_path [String] The path to the static site output.
def build(output_path: "docs")
	arguments = [NPX]
	arguments << "--yes" unless File.basename(NPX) == "pnpx"
	arguments.concat(["pagefind@1.5.2", "--site", output_path])
	
	unless system(*arguments)
		raise "Pagefind index build failed!"
	end
end
