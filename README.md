# U-M Library Design System

[![Netlify Status](https://api.netlify.com/api/v1/badges/46fd3abb-e61c-4a7e-b154-c22e375a3345/deploy-status)](https://app.netlify.com/sites/umich-lib-design-system/deploys) [![Maintained with Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

The design system is an open-source platform for web teams to reuse common solutions and learn from one another to help build accessible, inclusive, and high-quality websites.

## Looking for the documentation?

https://design-system.lib.umich.edu

## Contribute to repo

Getting started:

```
git clone https://github.com/mlibrary/design-system.git
cd design-system
npm install
```

Install, hoist, and share dependencies between packages:

```
npm run lerna:bootstrap
```

Build the packages:

```
npm run build
```

Start development:

```
npm start
```

Once started, a development environment of local packages for `@umich-lib/docs` is available at http://localhost:8080/ and `@umich-lib/components` at http://localhost:3333/.

For changes between packages to appear, stop the packages, rerun `npm build` then `npm start`. For example, for a `@umich-lib/css` change to appearing in `@umich-lib/docs`.

Each package has a CONTRIBUTING.md file for further details specific to that package.
