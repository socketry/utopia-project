# frozen_string_literal: true

require_relative "lib/utopia/project/version"

Gem::Specification.new do |spec|
	spec.name = "utopia-project"
	spec.version = Utopia::Project::VERSION
	
	spec.summary = "A project documentation tool based on Utopia."
	spec.authors = ["Samuel Williams", "Olle Jonsson", "dependabot[bot]", "Michael Adams"]
	spec.license = "MIT"
	
	spec.cert_chain  = ["release.cert"]
	spec.signing_key = File.expand_path("~/.gem/release.pem")
	
	spec.homepage = "https://github.com/socketry/utopia-project"
	
	spec.metadata = {
		"bug_tracker_uri" => "https://github.com/socketry/utopia-project/issues",
		"changelog_uri" => "https://github.com/socketry/utopia-project/blob/main/releases.md",
		"documentation_uri" => "https://socketry.github.io/utopia-project/",
		"funding_uri" => "https://github.com/sponsors/ioquatix/",
		"source_code_uri" => "https://github.com/socketry/utopia-project.git",
	}
	
	spec.files = Dir.glob(["{bake,context,lib,pages,public,template}/**/*", "*.md"], File::FNM_DOTMATCH, base: __dir__)
	
	spec.required_ruby_version = ">= 3.3"
	
	spec.add_dependency "decode", "~> 0.30"
	spec.add_dependency "falcon"
	spec.add_dependency "markly", "~> 0.17"
	spec.add_dependency "thread-local"
	spec.add_dependency "utopia", "~> 3.0.4"
end
