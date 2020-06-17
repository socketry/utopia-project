
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
def static(output_path: "docs")
	require 'rackula/command'
	
	config_path = File.expand_path("../../template/config.ru", __dir__)
	public_path = File.expand_path("../../public", __dir__)
	
	Rackula::Command::Top["generate", "--force",
		"--config", config_path,
		"--public", public_path,
		"--output-path", output_path
	].call
	
	FileUtils.touch File.expand_path(".nojekyll", output_path)
end
