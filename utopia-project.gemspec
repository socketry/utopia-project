# frozen_string_literal: true

require_relative "lib/utopia/project/version"

Gem::Specification.new do |spec|
	spec.name = "utopia-project"
	spec.version = Utopia::Project::VERSION
	
	spec.summary = "A project documentation tool based on Utopia."
	spec.authors = ["Samuel Williams", "Olle Jonsson", "dependabot[bot]", "Michael Adams"]
	spec.license = "MIT"
	
	spec.cert_chain  = ['release.cert']
	spec.signing_key = File.expand_path('~/.gem/release.pem')
	
	spec.homepage = "https://socketry.github.io/utopia-project"
	
	spec.metadata = {
		"funding_uri" => "https://github.com/sponsors/ioquatix/",
		"source_code_uri" => "https://github.com/socketry/utopia-project/",
	}
	
	spec.files = Dir.glob(['{bake,lib,pages,public,template}/**/*', '*.md'], File::FNM_DOTMATCH, base: __dir__)
	
	spec.required_ruby_version = ">= 3.1"
	
	spec.add_dependency "decode", "~> 0.17"
	spec.add_dependency "falcon"
	spec.add_dependency "markly", "~> 0.7"
	spec.add_dependency "rackula", "~> 1.3"
	spec.add_dependency "thread-local"
	spec.add_dependency "utopia", "~> 2.14"
end
