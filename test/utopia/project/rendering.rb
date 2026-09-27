# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "utopia/project/site"

describe "Project pages" do
	include Utopia::Project::SiteContext
	
	it "renders source examples and guides without descriptions" do
		response = client.get("/guides/source-example/index")
		expect(response.status).to be == 200
		expect(response.read).to be(:include?, "This example explains how to call the client.")
		body = client.get("/index").read
		expect(body).to be(:include?, "No description.")
		expect(body).to be(:include?, "This example explains how to call the client.")
	end
	
	it "renders examples, pragmas, multiple relationships and supplemental documentation" do
		response = client.get("/reference/Example/Client/index")
		body = response.read
		
		expect(response.status).to be == 200
		expect(body).to be(:include?, "Supplemental documentation for the client.")
		expect(body).to be(:include?, "Example: Send a message")
		expect(body).to be(:include?, "<summary><h4>Example.</h4></summary>")
		expect(body).to be(:include?, 'class="pragma asynchronous"')
		expect(body).to be(:include?, "; ")
		expect(body).to be(:include?, "/reference/Example/Logging/index")
		expect(body).to be(:include?, "/reference/Example/Metrics/index")
	end
	
	it "returns 404 for an unknown reference or guide" do
		["/reference/Missing/index", "/guides/missing/index"].each do |path|
			response = client.get(path)
			expect(response.status).to be == 404
			expect(response.read).to be(:include?, "File Not Found")
		end
	end
	
	it "renders release navigation and the missing releases fallback" do
		body = client.get("/releases/index").read
		expect(body).to be(:include?, 'href="#v1.1.0"')
		expect(body).to be(:include?, "Improved documentation.")
		File.unlink(File.join(@root, "releases.md"))
		expect(client.get("/releases/index").read).to be(:include?, "This project does not have a")
	end
	
	it "renders fallback content without a README" do
		File.unlink(File.join(@root, "readme.md"))
		body = client.get("/index").read
		expect(body).to be(:include?, "This project does not have a")
	end
	
	["Introductory paragraph.", "# *Formatted title*", ""].each do |markdown|
		with "README #{markdown.inspect}" do
			it "renders a fallback heading" do
				write("readme.md", markdown)
				response = client.get("/index")
				expect(response.status).to be == 200
				expect(response.read).to be(:include?, "<h1>Project</h1>")
			end
		end
	end
	
	["svg", "png"].each do |extension|
		with "#{extension} title image" do
			it "renders a logo and page title" do
				write("readme.md", "# ![Project Logo](logo.#{extension})\n\nIntroduction.")
				body = client.get("/index").read
				expect(body).to be(:include?, "<title>Project Logo</title>")
				expect(body).to be(:include?, "logo.#{extension}")
			end
		end
	end
	
	it "renders the exception document" do
		expect(client.get("/errors/exception").read).to be(:include?, "something didn't quite work out")
	end
	
	it "renders discussion settings when configured" do
		key = "UTOPIA_PROJECT_GISCUS_REPO"
		previous = ENV[key]
		begin
			ENV[key] = "example/project"
			expect(client.get("/reference/Example/Client/index").read).to be(:include?, 'data-repo="example/project"')
		ensure
			previous ? ENV[key] = previous : ENV.delete(key)
		end
	end
end

describe "Application configuration" do
	include Utopia::Project::SiteContext
	
	it "serves healthy requests with production exception middleware" do
		mock(UTOPIA) do |wrapper|
			wrapper.replace(:production?){true}
		end
		
		response = client.get("/index")
		expect(response.status).to be == 200
		expect(response.read).to be(:include?, "Example Project")
	end
	
	it "serves documentation with localization enabled" do
		@middleware = Utopia::Application.build do |builder|
			Utopia::Project.call(builder, @root, locales: ["en", "ja"])
		end
		
		response = client.get("/index", {"accept-language" => "ja"})
		expect(response.status).to be == 200
		expect(response.read).to be(:include?, "Example Project")
	end
	
	it "lists guides with and without descriptions" do
		response = client.get("/guides/index")
		expect(response.status).to be == 200
		expect(response.read).to be(:include?, "Source Example")
	end
end
