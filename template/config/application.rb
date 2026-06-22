# frozen_string_literal: true

require "utopia/setup"
Object.const_set(:UTOPIA, Utopia.setup(Dir.pwd)) unless Object.const_defined?(:UTOPIA)

require "utopia/project"

Application = Utopia::Project.application
