# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2020-2022, by Samuel Williams.

prepend Actions

on 'index' do
	@document = @base.releases_document
end