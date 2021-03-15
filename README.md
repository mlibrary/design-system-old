# U-M Library Design System

The design system is an open-source platform for web teams to reuse common solutions and learn from one another to help build accessible, inclusive, and high-quality websites.

Documentation: https://design-system.lib.umich.edu

| Package                                                                        | Latest release                                                 | Unstable build                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`@umich-lib/css`](https://www.npmjs.com/package/@umich-lib/css)               | ![](https://img.shields.io/npm/v/@umich-lib/css/latest)        | ![](https://img.shields.io/npm/v/@umich-lib/css/prerelease)        |
| [`@umich-lib/components`](https://www.npmjs.com/package/@umich-lib/components) | ![](https://img.shields.io/npm/v/@umich-lib/components/latest) | ![](https://img.shields.io/npm/v/@umich-lib/components/prerelease) |

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

Start development with either:

```
npm run develop
```

```
npm start
```

Once started, a development environment of local packages for `@umich-lib/docs` is available at http://localhost:8080/ and `@umich-lib/components` at http://localhost:3333/.

For changes between packages to appear, stop the packages, rerun `npm build` then `npm start`. For example, for a `@umich-lib/css` change to appearing in `@umich-lib/docs`.
