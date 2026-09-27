# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "utopia/project/site"
require "bake/context"
require "stringio"
require "yaml"

describe "Documentation tasks" do
	include Utopia::Project::SiteContext
	
	let(:context) {Bake::Context.load(@root)}
	
	it "updates README and agent context deterministically" do
		Dir.chdir(@root) do
			context["utopia:project:update"].call
			first = File.read("readme.md")
			index = YAML.load_file("context/index.yaml")
			
			expect(first).to be(:include?, "https://example.com/project/guides/getting-started/index")
			expect(first).to be(:include?, "This example explains how to call the client.")
			expect(first).to be(:include?, "v1.1.0")
			expect(first).to be(:include?, "#code-examples")
			expect(index["files"].map{|entry| entry["path"]}).to be == ["getting-started.md", "empty.md"]
			expect(File.read("context/getting-started.md")).to be == File.read("guides/getting-started/readme.md")
			context["utopia:project:update"].call
			expect(File.read("readme.md")).to be == first
			expect(YAML.load_file("context/index.yaml")).to be == index
		end
	end
	
	it "generates no context index when there are no guides" do
		FileUtils.remove_entry(File.join(@root, "guides"))
		expect(context["utopia:project:agent:context:update"].call).to be_nil
		expect(File).not.to be(:exist?, File.join(@root, "context/index.yaml"))
	end
	
	it "uses the homepage when no documentation URL is configured" do
		write("example.gemspec", 'Gem::Specification.new {|s| s.name = "example"; s.version = "1.0"; s.homepage = "https://example.com/fallback/"}')
		Dir.chdir(@root) do
			context["utopia:project:readme:update"].call
			expect(File.read("readme.md")).to be(:include?, "https://example.com/fallback/guides/getting-started/index")
		end
	end
	
	it "creates a project template in an empty directory" do
		mock(FileUtils::Verbose) do |wrapper|
			wrapper.replace(:cp_r){|source, destination| FileUtils.cp_r(source, destination)}
		end
		Dir.mktmpdir do |root|
			Dir.chdir(root) do
				context["utopia:project:create"].call
				expect(File).to be(:exist?, "config/serve.rb")
				expect(File.read("config/application.rb")).to be(:include?, "Utopia::Project.call")
			end
		end
	end
	
	it "extracts the first sentence as the project description" do
		previous = $stdout
		output = StringIO.new
		begin
			$stdout = output
			["# Example", "#", "##"].each do |heading|
				write("readme.md", "#{heading}\n\nFirst sentence. Second sentence.\n")
				context["utopia:project:description"].call
			end
		ensure
			$stdout = previous
		end
		expect(output.string).to be == "First sentence.\n" * 3
	end
	
	it "passes custom binding options to Falcon" do
		recipe = context["utopia:project:serve"]
		commands = []
		mock(recipe.instance) do |wrapper|
			wrapper.replace(:system){|*command| commands << command; true}
		end
		
		recipe.call(port: 9293, bind: "http://127.0.0.1")
		expect(commands.first.first(2)).to be == ["falcon", "serve"]
		expect(commands.first.last(4)).to be == ["--bind", "http://127.0.0.1", "--port", "9293"]
	end
	
	it "marks static output for GitHub Pages and builds its search index" do
		output = File.join(@root, "export")
		generate = context["utopia:static:generate"]
		mock(generate.instance) do |wrapper|
			wrapper.replace(:generate) do |output_path:, application_path:, public_path:, force:|
				expect(output_path).to be == output
				expect(force).to be == false
				expect(File).to be(:exist?, application_path)
				expect(File).to be(:directory?, public_path)
				FileUtils.mkdir_p(output_path)
			end
		end
		indexed = nil
		mock(context["utopia:project:search:build"].instance) do |wrapper|
			wrapper.replace(:build){|output_path:| indexed = output_path}
		end
		
		context["utopia:project:static"].call(output_path: output, force: false)
		expect(File).to be(:exist?, File.join(output, ".nojekyll"))
		expect(indexed).to be == output
	end
	
	it "builds search for the selected directory and propagates failures" do
		recipe = context["utopia:project:search:build"]
		commands = []
		mock(recipe.instance) do |wrapper|
			wrapper.replace(:system){|*command| commands << command; false}
		end
		
		expect{recipe.call(output_path: "a path with spaces")}.to raise_exception(RuntimeError, message: be =~ /Pagefind index build failed/)
		expect(commands.first.last(3)).to be == ["pagefind@1.5.2", "--site", "a path with spaces"]
	end
	
	it "builds Pagefind in order and returns its executable" do
		recipe = context["utopia:project:pagefind"]
		commands = []
		write("pagefind/target/release/pagefind", "#!/bin/sh\n")
		binary = File.join(@root, "pagefind/target/release/pagefind")
		File.chmod(0o755, binary)
		mock(recipe.instance) do |wrapper|
			wrapper.replace(:system) do |*command, chdir:|
				commands << [command, chdir]
				true
			end
		end
		
		expect(recipe.call(source_path: File.join(@root, "pagefind"))).to be == binary
		expect(commands.first).to be == [["npm", "ci"], File.join(@root, "pagefind/pagefind_web_js")]
		expect(commands.last).to be == [["cargo", "build", "--release", "--features", "extended"], File.join(@root, "pagefind/pagefind")]
	end
	
	it "reports failed Pagefind commands and missing executables" do
		recipe = context["utopia:project:pagefind"]
		mock(recipe.instance) do |wrapper|
			wrapper.replace(:system){false}
		end
		expect{recipe.call(source_path: @root)}.to raise_exception(RuntimeError, message: be =~ /Pagefind build failed/)
		mock(recipe.instance) do |wrapper|
			wrapper.replace(:system){true}
		end
		expect{recipe.call(source_path: @root)}.to raise_exception(RuntimeError, message: be =~ /did not produce an executable/)
	end
end
