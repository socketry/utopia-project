# GitHub Pages Integration

This guide shows you how to use `utopia-project` with GitHub Pages.

## Static Site Generation

Once you are happy with your project's documentation, simply generate a static site:

~~~ bash
$ bake utopia:project:static
~~~

This will generate a static copy of your documentation into `docs/` which is what is required by GitHub Pages.

## Enable GitHub Pages

In your GitHub project settings, you will need to [enable GitHub Pages served from `docs/`](https://help.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#choosing-a-publishing-source).
