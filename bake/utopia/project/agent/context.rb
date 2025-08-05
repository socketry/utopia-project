# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2025, by Samuel Williams.

def initialize(...)
	super
	
	require "utopia/project"
end

# Update agent context files from the guides.
def update
	project = Utopia::Project::Base.new(context.root)
	
	FileUtils.mkdir_p self.context_root
	files = []
	
	# Sort guides by order, then by name
	sorted_guides = project.guides.select(&:readme?).sort
	
	sorted_guides.each do |guide|
		FileUtils.cp guide.readme_path, self.context_path_for(guide)
		files << {
			"path" => guide.name + ".md",
			"title" => guide.title,
			"description" => guide.description.to_markdown.chomp,
		}
	end
	
	if files.any?
		# Create index in agent-context compatible format
		gemspec = project.gemspec
		index = {
			"description" => gemspec&.summary,
			"metadata" => gemspec&.metadata || {},
			"files" => files,
		}
		
		File.open(self.context_index_path, "w") do |file|
			file.puts "# Automatically generated context index for Utopia::Project guides."
			file.puts "# Do not edit then files in this directory directly, instead edit the guides and then run `bake utopia:project:agent:context:update`."
			YAML.dump(index, file)
		end
		
		return index
	end
	
	return nil
end

private

def context_root
	File.join(context.root, "context")
end

def context_path_for(guide)
	File.join(context_root, guide.name + ".md")
end

def context_index_path
	File.join(context_root, "index.yaml")
end
