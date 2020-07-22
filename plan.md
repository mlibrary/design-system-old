# Plan

A basic way to track what needs to be done and keep it close to source code.

## Goals

- Provide public documentation about Project U-Turn and getting started information for anyone to be able to start using what's available.
- Clarify the differences between Project U-Turn and React distributions.

## TODO

### React / umich-lib-ui

- [ ] REACT-1: Figure out how to archive and move away from the public documentation around the React components.

### Build / Lerna

- [ ] BUILD-1: Review publishing process and make sure we publish in a way that makes sense. Consider how to author alphas or "non-prod" version for testing? Document this so contributors know how to release changes.
- [ ] BUILD-2: Come up with a testing strategy. How do we test builds to know they're ready for production?

### components

- [ ] COMP-1: Consider if Storybook should live within the @umich-lib/components package and not at the root.
- [ ] COMP-2: Chat -- Reach out to stakeholders about when to use the Chat component.
- [ ] COMP-3: Universal Header -- Reach out to Heidi and folks about when to use component content.

### css

- [ ] CSS-1: Setup Gulp watch on `npm start` so that development doesn't required a re-start.
- [ ] CSS-2: Figure out optimal CSS performance distribution strategy so that it doesn't prevent a 100 lighthouse score. Checkout CSS wizardy: https://csswizardry.com/2020/05/the-fastest-google-fonts/ to begin.

### icons

- [ ] ICONS-1: Figure out a way to make the icon component only load what it needs. Investigate this and recommend improvements. Related article: https://paulcpederson.com/articles/stencil-icons/

### docs

- [ ] DOCS-1: Add code highlighting per line.
- [ ] DOCS-2: Usability test the docs with an LIT developer.
- [ ] DOCS-3: Improve the footer. Consider adding links to GitHub repo and Slack channel? What else?

### ideas

- [ ] IDEA-1: What if we made CDN for folks to access design assets? Such as the logo and so on. cdn.design-system.lib.umich.edu?
