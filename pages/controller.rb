
prepend Actions

on 'index' do
	@base = Utopia::Project::Base.instance
	
	if readme_path = @base.path_for('README.md')
		@document = Kramdown::Document.new(File.read(readme_path), syntax_highlighter: nil)
		
		if title = @document.root.children.shift
			@title = title.children.first.value
		end
		
		start = @document.root.children.index{|node| node.children.first&.value == "Usage"}
		finish = start + 1
		
		while node = @document.root.children[finish]
			if node.type == :header
				break
			else
				finish += 1
			end
		end
		
		@document.root.children[start...finish] = [
			Kramdown::Element.new(:raw, "<content:usage/>")
		]
	end
end
