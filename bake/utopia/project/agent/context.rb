def initialize(...)
	super
	
	require "utopia/project"
end

# Update agent context files from the guides.
def update
	project = Utopia::Project::Base.new(context.root)
	
	FileUtils.mkdir_p self.context_root
	index = {}
	
	project.guides.each do |guide|
		if guide.readme?
			FileUtils.cp guide.readme_path, self.context_path_for(guide)
			index[guide.name] = {
				"title" => guide.title,
				"order" => guide.order,
				"description" => guide.description.to_markdown.chomp,
			}
		end
	end
	
	if index.any?
		File.open(self.context_index_path, "w") do |file|
			file.puts "# Automatically generated context index for Utopia::Project guides."
			file.puts "# Do not edit then files in this directory directly, instead edit the guides and then run `bake utopia:project:agent:context:update`."
			YAML.dump(index, file)
		end
	end
	
	return index
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
