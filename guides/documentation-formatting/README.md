# Documentation Formatting

This guide explains the conventions used by `utopia-project` when generating documentation for your project.

## Source Code Documentation

Source code documentation is expected to be in markdown format. This is different from the canonical `RDoc` format used by Ruby. However, using markdown is a good format for standardised documentation across a range of different languages.

### Tags

#### `@param`

The `@param` tag is used to describe the parameters of a method:

~~~ ruby
# @parameter x [Integer] The x co-ordinate.
# @parameter y [Integer] The y co-ordinate.
def move(x, y)
	# ...
end
~~~

#### `@return`

The `@return` tag is used to describe the return type of the definition:

~~~ ruby
# @returns [Integer] The result of the computation.
def fib(n)
	# ...
end
~~~

### References

It is possible to insert references in your documentation using curly brackets. In the following example `{Input}` will be expanded relative to the usage, to some symbol named `Input`.

~~~ ruby
# Frobulates the input, see {Input} for more details.
def frobulate(input)
	# ... left to the imagination ...
end
~~~

## Examples & Guides

Examples provide structured information to help users understand your project and are located in the `examples/` directory. One sub-directory per example.

### `README.md`

If an example has a `README.md` file, it is used as the main source of documentation.

### Source Files

All other source files are listed on the example page. Top level comments with trailing code (segments) are used to help guide the user through the example.
