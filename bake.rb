
# Update the project documentation with the new version number.
#
# @parameter version [String] The new version number.
def after_gem_release_version_increment(version)
	context['changes:release'].call(version)
end
