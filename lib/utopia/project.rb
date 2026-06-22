# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

require "utopia/project/version"

require "variant"

require "utopia/application"
require "utopia/content"
require "utopia/controller"
require "utopia/exceptions"
require "utopia/localization"
require "utopia/redirection"
require "utopia/response"
require "utopia/static"

require_relative "project/base"
require_relative "project/import_map"

module Utopia
	module Project
		# The root directory of the web application files.
		SITE_ROOT = File.expand_path("../..", __dir__)
		
		# The root directory for the utopia middleware.
		PAGES_ROOT = File.expand_path("pages", SITE_ROOT)
		
		# The root directory for static assets.
		PUBLIC_ROOT = File.expand_path("public", SITE_ROOT)
		
		# Build a project application.
		#
		# @parameter root [String] The file-system root path of the project/gem.
		# @parameter locales [Array(String)] an array of locales to support, e.g. `['en', 'ja']`.
		def self.application(root = Dir.pwd, locales: nil)
			Utopia::Application.build(lambda {|request| Utopia::Response[404, {}, []]}) do
				if ::UTOPIA.production?
					# Handle exceptions in production with a error page and send an email notification:
					use Utopia::Exceptions::Handler
					use Utopia::Exceptions::Mailer
				end
				
				# We serve static files from the project root:
				use Utopia::Static, root: root
				
				use Utopia::Static, root: PUBLIC_ROOT
				
				use Utopia::Redirection::Rewrite, {
					"/" => "/index"
				}
				
				use Utopia::Redirection::DirectoryIndex
				
				use Utopia::Redirection::Errors, {
					404 => "/errors/file-not-found"
				}
				
				if locales
					use Utopia::Localization,
						default_locale: locales.first,
						locales: locales
				end
				
				use Utopia::Controller, root: PAGES_ROOT
				
				use Utopia::Content, root: PAGES_ROOT, namespaces: {
					# 'gallery' => Utopia::Gallery::Tags.new
				}
			end
		end
	end
end
