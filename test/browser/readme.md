# Browser Tests

These tests use the exported fixture project in `test/utopia/project/.fixtures/site`. They exercise navigation, search, diagrams, syntax highlighting, keyboard disclosures, and table layout at mobile and desktop widths in light and dark mode. The static server mounts the site at `/project/` to check GitHub Pages subpath handling.

Install the bundle with the maintenance group enabled, then install the browser dependencies:

``` sh
npm ci
npx playwright install chromium
```

Build the Pagefind fork using the revision and setup steps in `.github/workflows/documentation.yaml`. Set `PAGEFIND_BINARY_PATH` to its executable, then build the fixture and run the tests:

``` sh
bundle exec ruby fixtures/utopia/project/build_site.rb
npm run test:browser
```

Alternatively, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable. Failures save screenshots and Playwright traces in `test-results/`.

CI runs these checks in the documentation workflow, using the same Pagefind build as the published documentation. Browser checks do not contribute to the Ruby line coverage percentage.
