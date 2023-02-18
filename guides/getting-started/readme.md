# Getting Started

This guide explains how to use `utopia-project` for your own project.

## Installation

Firstly, add the gem to your project:

~~~ bash
$ bundle add utopia-project
~~~

## Start Local Server

Start the local server to preview documentation:

~~~ bash
$ bake utopia:project:serve
~~~

Right now, this server does not reload the code index, so you will need to restart the server to update the code index. This will be fixed in the future.

## Generate Static Site

You can generate a static copy of your documentation into the `docs/` folder:

~~~ bash
$ bake utopia:project:static
~~~

You can check the [guide for GitHub Pages](../github-pages-integration/index) which gives more details on how to deploy the static site using GitHub.
