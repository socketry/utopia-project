# Documentation Guides

This guide explains how to create and maintain documentation for your project using `utopia-project`.

## Overview

There are two main aspects to consider when creating documentation with `utopia-project`:

1. **Source Code Documentation**: This involves adding documentation directly within your code using special tags.
2. **Examples & Guides**: This includes creating separate example files and guides to help users understand how to use your project.

### Source Code Documentation

Source code documentation is included adjacent to the code it describes, using special tags to provide structured information. This allows for easy generation of documentation from the source code itself. The `utopia-project` documentation generator uses the `decode` gem (which is documented elsewhere).

However, in short:

- Documentation is expected to be in markdown format.
- You may embed links to definitions using `{MyClass}` or `{my_method}`.
- You can use tags:
  - `@parameters name [Type] Description.`
  - `@yields {|argument| ...} If a block is given.`
  - `@returns [Type] Description.`
- Classes and Modules should typically be described as "Represents a ..." where it makes sense to do so.

In addition, for complex classes that require extra documentation, e.g. `my_class.rb` can have an adjacent `my_class.md` which should have the title `# MyClass` and can include additional details, examples, and usage guidelines.

### Examples & Guides

In addition to source code documentation, it's helpful to provide separate examples and guides to demonstrate how to use your project. This can include:

- Code snippets that illustrate common use cases.
- Step-by-step tutorials for more complex scenarios.

By providing both inline documentation and separate guides, you can help users understand your project more easily and encourage adoption.

These resources are located in the `guides/` directory of your project, and have the following format:

```
guides/
├── links.yaml
├── documentation-guidelines/
│   └── readme.md
├── documentation-guides/
│   └── readme.md
├── getting-started/
│   └── readme.md
└── github-pages-integration/
    └── readme.md
```

The `links.yaml` file comes from the `utopia` framework, and is used to define metadata and ordering of the guides, e.g.

```yaml
# guides/links.yaml
getting-started:
  order: 1
github-pages-integration:
  order: 2
documentation-guides:
  order: 3
```

Every guide should start with a brief overview, explaining its purpose and what the user can expect to learn: "This guide explains how to use x to do y." – it should be short and to the point, as it's used as the description of the guide on other pages that link to it.

#### "Getting Started" Guide

Every project should have a "Getting Started" guide that provides an introduction to the project, including the following sections:

~~~markdown
# Getting Started

This guide explains how to get started with `$project`.

## Installation

Add the gem to your project:

```bash
$ bundle add $project
```

## Core Concepts

`$project` has several core concepts:

- A {ruby MyProject::MyClass} which represents the main entry point for using the project.

## Usage

Brief explaination about usage.

### Specific Scenario

More detailed explanation about usage in a specific scenario.

```ruby
# some example code
```
~~~

In the above example:

- "Core Concepts" is optional and should be included if it helps to clarify the usage and structure of the project.
- "Specific Scenario" only makes sense if there are more than one scenario that is typical.
