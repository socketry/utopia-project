# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2023-2024, by Samuel Williams.

require 'utopia/project'
require 'xrb'

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
	
	readme.replace_section("Releases", children: true) do |header|
		current = header
		
		releases_section = self.releases_section(documentation_url, project)
		releases_section.each do |child|
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
		@gemspec ||= ::Gem::Specification.load(gemspec_path)
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
	buffer = String.new
	
	buffer << "Please see the [project documentation](#{documentation_url}) for more details.\n"
	
	project.guides.each do |guide|
		buffer << "  - [#{guide.title}](#{guide.href(documentation_url)}) - #{guide.description.to_markdown}\n"
	end
	
	return Markly.parse(buffer)
end

def releases_section(documentation_url, project)
	buffer = String.new
	
	buffer << "Please see the [project releases](#{documentation_url}releases/index) for all releases.\n"

	project.releases.first(10).each do |release|
		buffer << "\n### #{release.name}\n\n"
		
		if notes = release.notes
			buffer << notes.to_markdown
		end
		
		release.changes.each do |change|
			buffer << "  - [#{change.to_markdown}](#{release.href(documentation_url, anchor: change.id)})\n"
		end
	end
	
	return Markly.parse(buffer)
end
