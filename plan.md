# Plan

A basic way to track what needs to be done and keep it close to source code.

## Goals

- Provide public documentation about Project U-Turn and getting started information for anyone to be able to start using what's available.
- Clarify the differences between Project U-Turn and React distributions.
- Document the existing most pressing work in a plain markdown file, right next to the code.

## TODO

### React / umich-lib-ui

- [ ] REACT-1: Figure out how to archive and move away from the public documentation around the React components.

### Build / Lerna

- [ ] BUILD-1: Review publishing process and make sure we publish in a way that makes sense. Consider how to author alphas or "non-prod" version for testing? Document this so contributors know how to release changes.
- [ ] BUILD-2: Come up with a testing strategy. How do we test builds to know they're ready for production?

### Components

- [ ] COMP-1: Consider if Storybook should live within the @umich-lib/components package and not at the root.
- [ ] COMP-2: Chat -- Reach out to stakeholders about when to use the Chat component. Probably someone from Ask a Librarian staff.
- [ ] COMP-3: Universal Header -- Reach out to Heidi and folks about when to use component content.

### CSS

- [ ] CSS-1: Setup Gulp watch on `npm start` so that development doesn't required a re-start.
- [ ] CSS-2: Figure out optimal CSS performance distribution strategy so that it doesn't prevent a 100 lighthouse score. Checkout CSS wizardy: https://csswizardry.com/2020/05/the-fastest-google-fonts/ to begin.

### icons

- [ ] ICONS-1: Figure out a way to make the icon component only load what it needs. Investigate this and recommend improvements. Is this even a performance concern? Related article: https://paulcpederson.com/articles/stencil-icons/

### docs

- [ ] DOCS-1: Add code highlighting per line.
- [ ] DOCS-2: Usability test the docs with a LIT developer.
- [ ] DOCS-3: Improve the footer. Consider adding links to GitHub repo and Slack channel? What else?
- [ ] DOCS-4: At the end of every month, post monthly updates from /updates to Slack #design-system. Fancy bonus points, make a Slack bot to post the latest month in the 11ty collection of updates. BAM.
- [ ] DOCS-5: Make a 100, 100, 100, ... lighthouse SCORE, ftw.
- [ ] DOCS-6: MAXIMIZE THE SEO. Add an image or something.

### Developer engagment

- [ ] DEVE-1: Gather input from LIT developers regarding how they could best use the Design System web components. Consider Shoelace as an example to mini hack-a-thon. We need insight on what needs to be built out, resonate, and be useful for folks. eg, should variations of button be class names or a web component.

### ideas

- [ ] IDEA-1: What if we made CDN for folks to access design assets? Such as the logo and so on. cdn.design-system.lib.umich.edu?
- [ ] IDEA-2: Reclassification to "web developer thief".
