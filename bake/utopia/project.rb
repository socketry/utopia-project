# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2022, by Samuel Williams.

# Create an empty project in the current directory.
def create
	template_path = File.expand_path("../../template/*", __dir__)
	
	Dir.glob(template_path) do |path|
		FileUtils::Verbose.cp_r path, Dir.pwd
	end
end

# Serve the project using a web server.
# Binds to `https://localhost:9292` by default.
#
# @parameter port [Integer] The port to bind to.
# @parameter bind [String] The URL to bind to, e.g. `http://localhost:80`.
def serve(port: nil, bind: nil)
	config_path = File.expand_path("../../template/config.ru", __dir__)
	preload_path = File.expand_path("../../template/preload.rb", __dir__)
	
	options = []
	
	if bind
		options << "--bind" << bind
	end
	
	if port
		options << "--port" << port
	end
	
	system("falcon", "serve", "--config", config_path, "--preload", preload_path, *options)
end

# Generate a static copy of the site.
# @parameter output_path [String] The output path for the static site.
# @parameter force [Boolean] Remove the output directory before generating the static content.
def static(output_path: "docs", force: true)
	require 'rackula/command'
	
	config_path = File.expand_path("../../template/config.ru", __dir__)
	public_path = File.expand_path("../../public", __dir__)
	
	arguments = []
	
	if force
		arguments << "--force"
	end
	
	Rackula::Command::Top["generate", *arguments,
		"--config", config_path,
		"--public", public_path,
		"--output-path", output_path
	].call
	
	FileUtils.touch File.expand_path(".nojekyll", output_path)
end

# Extract a description for the project.
def description(root: context.root)
	require 'markly'
	
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
