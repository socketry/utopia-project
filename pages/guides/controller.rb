
prepend Actions

on 'index' do
	@base = Utopia::Project::Base.instance
end

on '**/*/index' do |request, path|
	@base = Utopia::Project::Base.instance
	
	name = path.components[-2]
	
	@guide = @base.guides.find do |guide|
		guide.name == name
	end
	
	path.components = ["show"]
end
