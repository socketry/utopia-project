require_relative 'lib/utopia/project/version'

Gem::Specification.new do |spec|
	spec.name = "utopia-project"
	spec.version = Utopia::Project::VERSION
	spec.authors = ["Samuel Williams"]
	spec.email = ["samuel.williams@oriontransfer.co.nz"]
	
	spec.summary = "A project documentation tool based on Utopia."
	spec.homepage = "https://socketry.github.io/utopia-project/"
	spec.license = "MIT"
	
	spec.metadata = {
		"source_code_uri" => "https://github.com/socketry/utopia-project/",
		"funding_uri" => "https://github.com/sponsors/ioquatix/",
	}
	
	spec.required_ruby_version = "~> 2.5"
	
	spec.files = Dir['{bake,lib,pages,public,template}/**/*', base: __dir__]
	spec.require_paths = ["lib"]
	
	spec.add_dependency "utopia", "~> 2.14"
	# spec.add_dependency "utopia-gallery"
	
	spec.add_dependency "markly"
	spec.add_dependency "decode", "~> 0.13"
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
