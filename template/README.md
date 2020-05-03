# Project Documentation

## Usage

If you don't have Ruby installed yet, please do so using your system's package manager.

### Initial Installation

To install the Ruby gems to serve the documentation:

	bundle install

### Local Server

To start the documentation server locally:

	bake utopia:project:serve

You can then access the project: https://localhost:9292

### Static Site

To generate a static site:

	bake utopia:project:static

This will generate a complete static copy of the project documentation in the `static/` directory.
