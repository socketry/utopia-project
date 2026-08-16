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
	
	it "groups inherited methods by their direct relationship" do
		groups = inheritance.inherited_methods
		methods = groups.to_h do |group|
			[[group.kind, group.definition.qualified_name], group.methods.map(&:name)]
		end
		
		expect(methods).to be == {
			[:prepend, "Example::Prepended"] => ["#prepended_method"],
			[:include, "Example::Included"] => ["#included_method"],
			[:super_class, "Example::Parent"] => ["#parent_method", "#parent_included_method", "#grandparent_method", ".parent_class_method", ".singleton_class_method"],
			[:extend, "Example::Extended"] => [".extended_method"],
		}
		
		parent = groups.find{|group| group.definition.qualified_name == "Example::Parent"}
		parent_included_method = parent.methods.find{|method| method.name == "#parent_included_method"}
		expect(parent_included_method.definition.qualified_name).to be == "Example::ParentIncluded#parent_included_method"
	end
end
