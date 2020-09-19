source "https://rubygems.org"

# Specify your gem's dependencies in utopia-project.gemspec
gemspec

group :maintenance, optional: true do
	gem "bake-bundler"
	gem "bake-modernize"
end

# gem "decode", path: "../../ioquatix/decode"
