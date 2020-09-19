
require_relative "lib/utopia/project/version"

Gem::Specification.new do |spec|
	spec.name = "utopia-project"
	spec.version = Utopia::Project::VERSION
	
	spec.summary = "A project documentation tool based on Utopia."
	spec.authors = ["Samuel Williams"]
	spec.license = "MIT"
	
	spec.homepage = "https://socketry.github.io/utopia-project/"
	
	spec.metadata = {
		"funding_uri" => "https://github.com/sponsors/ioquatix/",
		"source_code_uri" => "https://github.com/socketry/utopia-project/",
	}
	
	spec.files = Dir.glob('{bake,lib,pages,public,template}/**/*', File::FNM_DOTMATCH, base: __dir__)
	
	spec.required_ruby_version = ">= 2.5"
	
	spec.add_dependency "decode", "~> 0.13"
	spec.add_dependency "falcon"
	spec.add_dependency "markly", "~> 0.5"
	spec.add_dependency "rackula"
	spec.add_dependency "thread-local"
	spec.add_dependency "utopia", "~> 2.14"
	
	spec.add_development_dependency "async-rspec"
	spec.add_development_dependency "bundler"
	spec.add_development_dependency "covered"
	spec.add_development_dependency "rack-test"
	spec.add_development_dependency "rspec"
end
