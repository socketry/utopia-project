# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "utopia/project/inheritance"

require "decode"

describe Utopia::Project::Inheritance do
	let(:path) {File.expand_path(".fixtures/inheritance.rb", __dir__)}
	let(:index) {Decode::Index.for(path)}
	let(:definition) {index.definitions.fetch("Example::Child")}
	let(:inheritance) {subject.new(index, definition)}
	
	it "resolves declared relationships" do
		relationships = inheritance.relationships.to_h do |relationship|
			[relationship.kind, relationship.definition.qualified_name]
		end
		
		expect(relationships).to be == {
			super_class: "Example::Parent",
			prepend: "Example::Prepended",
			include: "Example::Included",
			extend: "Example::Extended",
		}
	end
	
	it "groups inherited methods by their origin" do
		methods = inheritance.inherited_methods.to_h do |group|
			[group.definition.qualified_name, group.methods.map(&:name)]
		end
		
		expect(methods).to be == {
			"Example::Prepended" => ["#prepended_method"],
			"Example::Included" => ["#included_method"],
			"Example::Parent" => ["#parent_method", ".parent_class_method", ".singleton_class_method"],
			"Example::Extended" => [".extended_method"],
		}
	end
end
