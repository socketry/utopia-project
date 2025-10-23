# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2025, by Samuel Williams.

require "utopia/project/version"

require "variant"

require "utopia/localization"

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
		
		# Appends a project application to the rack builder.
		#
		# @parameter builder [Rack::Builder]
		# @parameter root [String] The file-system root path of the project/gem.
		# @parameter locales [Array(String)] an array of locales to support, e.g. `['en', 'ja']`.
		def self.call(builder, root = Dir.pwd, locales: nil)
			if UTOPIA.production?
				# Handle exceptions in production with a error page and send an email notification:
				builder.use Utopia::Exceptions::Handler
				builder.use Utopia::Exceptions::Mailer
			else
				# We want to propate exceptions up when running tests:
				builder.use Rack::ShowExceptions unless UTOPIA.testing?
			end
			
			# We serve static files from the project root:
			builder.use Utopia::Static, root: root
			
			builder.use Utopia::Static, root: PUBLIC_ROOT
			
			builder.use Utopia::Redirection::Rewrite, {
				"/" => "/index"
			}
			
			builder.use Utopia::Redirection::DirectoryIndex
			
			builder.use Utopia::Redirection::Errors, {
				404 => "/errors/file-not-found"
			}
			
			if locales
				builder.use Utopia::Localization,
					default_locale: locales.first,
					locales: locales
			end
			
			builder.use Utopia::Controller, root: PAGES_ROOT
			
			cache_root = File.expand_path("_gallery", root)
			
			builder.use Utopia::Content, root: PAGES_ROOT, namespaces: {
				# 'gallery' => Utopia::Gallery::Tags.new
			}
			
			builder.run lambda {|env| [404, {}, []]}
		end
	end
end
