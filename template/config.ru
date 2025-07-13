# frozen_string_literal: true

require "utopia/setup"
UTOPIA ||= Utopia.setup(Dir.pwd)

require "utopia/project"
Utopia::Project.call(self)
