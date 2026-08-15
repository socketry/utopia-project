# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

# Build Pagefind from a source checkout.
#
# @parameter source_path [String] The path to the Pagefind source checkout.
def build(source_path: ".pagefind")
	source_path = File.expand_path(source_path)
	
	commands = [
		[["npm", "ci"], "pagefind_web_js"],
		[["npm", "ci"], "pagefind_ui/default"],
		[["npm", "ci"], "pagefind_ui/modular"],
		[["npm", "ci"], "pagefind_ui/component"],
		[["npm", "ci"], "pagefind_playground"],
		[["./local_build.sh"], "pagefind_web"],
		[["npm", "run", "build-coupled"], "pagefind_web_js"],
		[["npm", "run", "build"], "pagefind_ui/default"],
		[["npm", "run", "build"], "pagefind_ui/modular"],
		[["npm", "run", "build"], "pagefind_ui/component"],
		[["npm", "run", "build"], "pagefind_playground"],
		[["cargo", "build", "--release", "--features", "extended"], "pagefind"],
	]
	
	commands.each do |command, directory|
		working_directory = File.join(source_path, directory)
		
		unless system(*command, chdir: working_directory)
			raise "Pagefind build failed in #{directory}: #{command.join(" ")}"
		end
	end
	
	binary_path = File.join(source_path, "target/release/pagefind")
	
	unless File.executable?(binary_path)
		raise "Pagefind build did not produce an executable at #{binary_path}"
	end
end
