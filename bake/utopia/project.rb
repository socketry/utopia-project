
# Create an empty project in the current directory.
def create
	template_path = File.expand_path("../../template/*", __dir__)
	
	Dir.glob(template_path) do |path|
		FileUtils::Verbose.cp_r path, Dir.pwd
	end
end

# Serve the project locally.
def serve
	system("bundle", "exec", "falcon", "serve")
end

def static(output_path: "static")
	require 'rackula/command'
	
	public_path = File.expand_path("../../public", __dir__)
	
	Rackula::Command::Top["generate", "--force", "--public", public_path, "--output-path", output_path].call
end
