# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2026, by Samuel Williams.

require "tmpdir"
require "fileutils"
require "utopia/project"
require_relative "../../../template/config/environment"
require "sus/fixtures/protocol/http/middleware_context"

module Utopia
	module Project
		module SiteContext
			include Sus::Fixtures::Protocol::HTTP::MiddlewareContext
			
			SITE = File.expand_path("../../../test/utopia/project/.fixtures/site", __dir__)
			
			def around(&block)
				previous = Thread.current.thread_variable_get(Base.name)
				Dir.mktmpdir("utopia-project-test") do |root|
					@root = root
					FileUtils.cp_r("#{SITE}/.", root)
					Base.instance = base
					super(&block)
				end
			ensure
				Base.instance = previous
			end
			
			def base
				@base ||= Base.new(@root).tap do |base|
					base.update(Dir.glob("#{@root}/lib/**/*.rb"))
				end
			end
			
			def middleware
				@middleware ||= Utopia::Application.build do |builder|
					Project.call(builder, @root)
				end
			end
			
			def write(path, content)
				path = File.join(@root, path)
				FileUtils.mkdir_p(File.dirname(path))
				File.write(path, content)
			end
		end
	end
end
