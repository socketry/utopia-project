# Getting Started

This guide explains how to preview the example project.

## Installation

Install the project before running the examples.

~~~ ruby
Example::Client.new
~~~

## Usage

| Task | Command | Result |
| --- | --- | --- |
| Preview | `bake utopia:project:serve` | Serve documentation while editing guides. |
| Build | `bake utopia:project:static` | Generate documentation for static hosting. |

~~~ mermaid
flowchart LR
  Source --> Documentation
~~~

### Configuration

See ruby:`Example::Client#call`.

## Deployment

Publish the generated documentation.

### Configuration

Check links after deployment.
