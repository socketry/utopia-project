
# Create an empty project in the current directory.
def create
	template_path = File.expand_path("../../template/*", __dir__)
	
	Dir.glob(template_path) do |path|
		FileUtils::Verbose.cp_r path, Dir.pwd
	end
end

# Serve the project locally.
def serve
	config_path = File.expand_path("../../template/config.ru", __dir__)
	preload_path = File.expand_path("../../template/preload.rb", __dir__)
	
	system("falcon", "serve", "--config", config_path, "--preload", preload_path)
end

def static(output_path: "docs")
	require 'rackula/command'
	
	public_path = File.expand_path("../../public", __dir__)
	
	Rackula::Command::Top["generate", "--force", "--public", public_path, "--output-path", output_path].call
end
