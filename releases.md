# Changes

## Unreleased

  - Fixed duplicate heading IDs when multiple sections have the same title. Permalinks and sidebar scroll tracking now work correctly when you have headings with identical text in different sections (e.g., multiple "Deployment" subsections under "Kubernetes" and "Systemd").
  - Improved guides index page to show guide summaries (first paragraph) instead of just listing titles.
  - Added previous/next navigation at the top and bottom of guide pages for easier sequential reading.

## v0.37.3

  - Support for `@example` pragmas from the `decode` gem, allowing inline code examples to be rendered in API documentation.

## v0.37.2

  - Fix mermaid diagram text color in dark mode.

## v0.36.0

  - Introduce `bake utopia:project:update` which invokes readme and agent context updates.

## v0.34.1

  - Fix schema for `index.yaml` context file.

## v0.34.0

  - Introduce `bake utopia:project:agent:context:update` command to update the agent context from the guides in the project.

## v0.33.2

  - Fixed handling of segmented code guides when rendered into a `readme.md` file.

## v0.33.0

  - Fix presentation of release notes on releases page.

## v0.31.0

  - Support brief release notes in `releases.md` document.

## v0.30.0

### Rename `changes.md` to `releases.md`

The `changes.md` document has been renamed to `releases.md` to better reflect its purpose.

## v0.29.0

### Improve `changes.md` document organization

Previously, level 1 headings were considered releases. This was changed to level 2 headings to allow for a level 1 heading to be used as the title of the document.

## v0.28.0

### Introduce `changes.md` document

A new changes document, if present, will be used to display changes in the release notes. The changes document should be named `changes.md` and should be placed in the root of the project. The changes document should be written in markdown format.
