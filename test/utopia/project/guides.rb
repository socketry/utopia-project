# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "utopia/project/site"

describe Utopia::Project::Guides do
	include Utopia::Project::SiteContext
	
	it "sorts by order and then name, treating unspecified orders as zero" do
		guides = [
			["alpha", {}], ["zebra", {order: 1}], ["beta", {order: 1}],
			["gamma", {order: 2}], ["delta", {}],
			["omega", {order: -1}], ["charlie", {order: 0}]
		].map do |name, metadata|
			Utopia::Project::Guide.new(base, File.join(@root, "guides", name), metadata)
		end
		
		expect(guides.sort.map(&:name)).to be == ["omega", "alpha", "charlie", "delta", "beta", "zebra", "gamma"]
		expect(guides.reverse.sort.map(&:name)).to be == ["omega", "alpha", "charlie", "delta", "beta", "zebra", "gamma"]
	end
	
	it "finds guides and handles navigation boundaries" do
		guides = base.guides
		first, middle, last = guides.to_a
		
		expect(guides["getting-started"]).to be_equal(first)
		expect(guides["missing"]).to be_nil
		expect(guides.related(first)).to be == [nil, middle]
		expect(guides.related(middle)).to be == [first, last]
		expect(guides.related(last)).to be == [middle, nil]
		unknown = Utopia::Project::Guide.new(base, File.join(@root, "missing"), {})
		expect(guides.related(unknown)).to be == [nil, nil]
	end
	
	it "extracts source documentation for a guide without a README" do
		guide = base.guides["source-example"]
		
		expect(guide.readme?).to be == false
		expect(guide.title).to be == "Source Example"
		expect(guide.documentation.text.join).to be(:include?, "This example explains")
		expect(guide.sources.map{|source| File.basename(source.path)}).to be == ["example.rb"]
		expect(guide.navigation.any?).to be == false
	end
	
	it "allows guides without an introductory paragraph or source documentation" do
		guide = base.guides["empty"]
		
		expect(guide.title).to be == "Empty Guide"
		expect(guide.description).to be_nil
		expect(guide.documentation).to be_nil
	end
end
