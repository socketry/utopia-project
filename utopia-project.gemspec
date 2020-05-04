require_relative 'lib/utopia/project/version'

Gem::Specification.new do |spec|
	spec.name = "utopia-project"
	spec.version = Utopia::Project::VERSION
	spec.authors = ["Samuel Williams"]
	spec.email = ["samuel.williams@oriontransfer.co.nz"]
	
	spec.summary = "A project documentation tool based on Utopia."
	spec.homepage = "https://github.com/socketry/utopia-project"
	spec.license = "MIT"
	
	spec.files = Dir.chdir(File.expand_path('..', __FILE__)) do
		`git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(docs|test|spec|features)/}) }
	end
	
	spec.require_paths = ["lib"]
	
	spec.add_dependency "utopia", "~> 2.14"
	# spec.add_dependency "utopia-gallery"
	
	spec.add_dependency "kramdown"
	spec.add_dependency "decode"
	spec.add_dependency "rackula"
	spec.add_dependency "falcon"
	spec.add_dependency "thread-local"
	
	spec.add_development_dependency 'async-rspec'
	spec.add_development_dependency 'rack-test'
	
	spec.add_development_dependency 'covered'
	spec.add_development_dependency 'bundler'
	spec.add_development_dependency 'rspec'
	spec.add_development_dependency 'bake-bundler'
end
