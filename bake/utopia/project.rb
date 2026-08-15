# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2026, by Samuel Williams.

def initialize(context)
	super
	
	require "fileutils"
end

# Create an empty project in the current directory.
def create
	template_path = File.expand_path("../../template/*", __dir__)
	
	Dir.glob(template_path) do |path|
		FileUtils::Verbose.cp_r path, Dir.pwd
	end
end

# Update the project files.
#
# - Update the README file.
# - Update the agent context.
#
# This task can be used as part of a pre-release process.
def update
	context["utopia:project:agent:context:update"].call
	context["utopia:project:readme:update"].call
end

# Serve the project using a web server.
# Binds to `https://localhost:9292` by default.
#
# @parameter port [Integer] The port to bind to.
# @parameter bind [String] The URL to bind to, e.g. `http://localhost:80`.
def serve(port: nil, bind: nil)
	config_path = File.expand_path("../../template/config/serve.rb", __dir__)
	preload_path = File.expand_path("../../template/preload.rb", __dir__)
	
	options = []
	
	if bind
		options << "--bind" << bind
	end
	
	if port
		options << "--port" << port.to_s
	end
	
	system("falcon", "serve", "--config", config_path, "--preload", preload_path, *options)
end

# Generate a static copy of the site.
# @parameter output_path [String] The output path for the static site.
# @parameter force [Boolean] Remove the output directory before generating the static content.
def static(output_path: "docs", force: true)
	application_path = File.expand_path("../../template/config/application.rb", __dir__)
	public_path = File.expand_path("../../public", __dir__)
	
	context["utopia:static:generate"].call(
		output_path: output_path,
		application_path: application_path,
		public_path: public_path,
		force: force,
	)
	
	FileUtils.touch File.expand_path(".nojekyll", output_path)
	
	context["utopia:project:search:build"].call(output_path: output_path)
end

# Build Pagefind from a source checkout.
#
# This task temporarily supports building our Pagefind fork until the required
# functionality is available in an official release.
#
# @parameter source_path [String] The path to the Pagefind source checkout.
def pagefind(source_path: ".pagefind")
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
	
	binary_path
end

# Extract a description for the project.
def description(root: context.root)
	require "markly"
	
	readme_path = File.join(root, "readme.md")
	if File.exist?(readme_path)
		document = Markly.parse(File.read(readme_path))
		child = document.first_child
		
		if child&.type == :header
			title = child.first_child.string_content
			
			# First sentence
			if introduction = child.next
				$stdout.puts introduction.to_plaintext[/.*?\./]
			end
		end
	end
end
