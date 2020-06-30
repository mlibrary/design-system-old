# Plan

A basic way to track what needs to be done and keep it close to source code.

## Goals

- Provide public documentation about Project U-Turn and getting started information for anyone to be able to start using what's available.
- Clarify the differences between Project U-Turn and React distributions.

## TODO

### Build / Lerna

- [ ] BUILD-1: BUG -- Setup start/build script to avoid a race condition. @umich-lib/components must built before @umich-lib/docs, for example, otherwise it will error. The present workaround is to build at least once then start. We may want to build CSS -> Components -> DOCS, but this needs further investigation.

### components

- [ ] COMP-1: Figure out a component documentation strategy and then configure @umich-lib/components docs-json output ([auto-generated JSON documentation](https://stenciljs.com/docs/docs-json)). Then distribute that JSON, so that it can be consumed, by @umich-lib/docs for example.
- [ ] COMP-2: Consider if Storybook should live within the @umich-lib/components package and not at the root.

### css

- [ ] CSS-1: Setup Gulp watch on `npm start` so that development doesn't required a re-start.

### icons

- [ ] ICONS-1: Figure out a way to make the icon component only load what it needs. Investigate this and recommend improvements. Related article: https://paulcpederson.com/articles/stencil-icons/

### docs

- [x] DOCS-1: Import @umich-lib/components doc JSON.
- [x] DOCS-2: Generate component pages.
- [x] DOCS-3: Create introduction / getting started page.
- [x] DOCS-4: Add code highlighting.
- [ ] DOCS-5: Add code highlighting per line.
- [ ] DOCS-6: Figure out a FOUC solution.
- [ ] DOCS-7: Add favicon.

- [ ] DOCS-N: Usability test the docs with an LIT developer.
