# Changes

## Unreleased

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
