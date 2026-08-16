# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

module Utopia
	module Project
		# Resolves relationships and inherited methods for a definition.
		class Inheritance
			# A relationship declared by a definition.
			Relationship = Struct.new(:kind, :name, :definition)
			
			# A method inherited from another definition.
			Method = Struct.new(:name, :definition)
			
			# A group of inherited methods with the same origin.
			Group = Struct.new(:definition, :methods)
			
			# Initialize inheritance resolution for the given definition.
			# @parameter index [Decode::Index] The index used to resolve relationships.
			# @parameter definition [Decode::Definition] The definition to inspect.
			def initialize(index, definition)
				@index = index
				@definition = definition
			end
			
			# The definition being inspected.
			# @attribute [Decode::Definition]
			attr :definition
			
			# Enumerate the directly declared relationships.
			# @returns [Array(Relationship)] The relationships in declaration order.
			def relationships
				@relationships ||= begin
					relationships = []
					
					if @definition.respond_to?(:super_class) && (name = @definition.super_class)
						relationships << relationship(:super_class, name)
					end
					
					{
						prepends: :prepend,
						includes: :include,
						extends: :extend,
					}.each do |attribute, kind|
						if @definition.respond_to?(attribute)
							@definition.public_send(attribute).each do |name|
								relationships << relationship(kind, name)
							end
						end
					end
					
					relationships
				end
			end
			
			# Enumerate documented public and protected methods inherited by the definition.
			# @returns [Array(Group)] Methods grouped by the definition which provides them.
			def inherited_methods
				@groups = []
				@groups_by_definition = {}
				
				collect_instance_methods(@definition, false, {}, {})
				collect_class_methods(@definition, false, {}, {})
				
				return @groups
			end
			
			private
			
			def relationship(kind, name)
				Relationship.new(kind, name, resolve(name, @definition))
			end
			
			def resolve(name, relative_to)
				reference = relative_to.language.reference_for(name)
				@index.lookup(reference, relative_to: relative_to)
			end
			
			def relationship_definitions(definition, attribute)
				return [] unless definition.respond_to?(attribute)
				
				definition.public_send(attribute).filter_map do |name|
					resolve(name, definition)
				end
			end
			
			def super_class_for(definition)
				if definition.respond_to?(:super_class) && (name = definition.super_class)
					resolve(name, definition)
				end
			end
			
			def methods_for(definition, prefix)
				return [] unless node = @index.trie.lookup(definition.full_path)
				
				methods = node.children.values.flat_map do |child|
					child.values || []
				end.select do |child|
					child.nested_name.start_with?(prefix)
				end
				
				methods.group_by(&:nested_name).map do |name, definitions|
					definitions.find(&:documented?) || definitions.first
				end
			end
			
			def singleton_for(definition)
				if node = @index.trie.lookup(definition.full_path)
					if singleton = node.children[:self]
						return singleton.values&.first
					end
				end
			end
			
			def collect_instance_methods(definition, include_own, seen, visited, display_prefix = "#")
				key = [definition.qualified_name, display_prefix]
				return if visited[key]
				visited[key] = true
				
				relationship_definitions(definition, :prepends).reverse_each do |relationship|
					collect_instance_methods(relationship, true, seen, visited, display_prefix)
				end
				
				collect_methods(definition, "#", display_prefix, include_own, seen)
				
				relationship_definitions(definition, :includes).reverse_each do |relationship|
					collect_instance_methods(relationship, true, seen, visited, display_prefix)
				end
				
				if display_prefix == "#" && (super_class = super_class_for(definition))
					collect_instance_methods(super_class, true, seen, visited, display_prefix)
				end
			end
			
			def collect_class_methods(definition, include_own, seen, visited)
				key = definition.qualified_name
				return if visited[key]
				visited[key] = true
				
				collect_methods(definition, ".", ".", include_own, seen)
				if singleton = singleton_for(definition)
					collect_methods(singleton, "#", ".", include_own, seen, definition)
				end
				
				relationship_definitions(definition, :extends).reverse_each do |relationship|
					collect_instance_methods(relationship, true, seen, {}, ".")
				end
				
				if super_class = super_class_for(definition)
					collect_class_methods(super_class, true, seen, visited)
				end
			end
			
			def collect_methods(definition, source_prefix, display_prefix, include_own, seen, origin = definition)
				methods_for(definition, source_prefix).each do |method|
					name = "#{display_prefix}#{method.name}"
					next if seen[name]
					seen[name] = true
					
					# Constructors are invoked through `.new` and are not useful as
					# inherited methods.
					if source_prefix == "#" && method.name == :initialize
						next
					end
					
					next unless include_own
					next unless method.documented?
					next if method.respond_to?(:private?) && method.private?
					
					add_method(origin, name, method)
				end
			end
			
			def add_method(definition, name, method)
				group = @groups_by_definition[definition.qualified_name] ||= begin
					group = Group.new(definition, [])
					@groups << group
					group
				end
				
				group.methods << Method.new(name, method)
			end
		end
	end
end
