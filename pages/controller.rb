
prepend Actions

on 'index' do
	@base = Utopia::Project::Base.instance
	
	if readme_path = @base.path_for('README.md')
		@document = Utopia::Project::Document.new(File.read(readme_path), @base)
		
		@document.replace_section("Usage") do |header|
			header.insert_after(@document.html_node("<content:usage/>"))
		end
	end
end
