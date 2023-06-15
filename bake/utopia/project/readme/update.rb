
require 'utopia/project'
require 'trenni'

def update(path: "readme.md", documentation_url: nil)
	project = Utopia::Project::Base.new(context.root)
	readme = project.readme_document
	
	documentation_url ||= public_documentation_url
	
	readme.replace_section("Usage") do |header|
		current = header
		
		usage_section = self.usage_section(documentation_url, project)
		usage_section.each do |child|
			current.insert_after(child)
			current = child
		end
	end
	
	File.write(path, readme.root.to_markdown)
end

private

Scope = Struct.new(:documentation_url, :project)

def gemspec_path
	Dir.glob("*.gemspec", base: context.root).first
end

def gemspec
	if gemspec_path = self.gemspec_path
		@gemspec ||= Gem::Specification.load(gemspec_path)
	end
end

# The public documentation URL if it can be determined.
def public_documentation_url
	if metadata = gemspec.metadata
		if documentation_uri = metadata['documentation_uri']
			return documentation_uri
		end
	end
	
	return gemspec&.homepage
end

def usage_section(documentation_url, project)
	template = Trenni::Template.load_file(File.expand_path("usage.trenni", __dir__))
	scope = Scope.new(documentation_url, project)
	
	output = template.to_string(scope)
	
	return Markly.parse(output)
end
