
prepend Actions

on 'index' do
	@base = Utopia::Project::Base.instance
end

on '**/*/index' do |request, path|
	@base = Utopia::Project::Base.instance
	
	lexical_path = path.components.dup
	# Remove the last "index" part:
	lexical_path.pop
	
	@node, @symbol = @base.lookup(lexical_path)
	
	unless @symbol
		fail! :not_found
	end
	
	path.components = ["show"]
end
