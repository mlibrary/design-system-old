# @umich-lib/css TODOs

Last updated December 2, 2020

- [ ] Create Tailwind Maize Theme file in the distribution. The object is being created in tailwind-theme-maize.js, but it needs to be generated in the dist thru some build script process. This way products can consume the theme and do what they wish with customization.

- [ ] Add compression to the umich-lib.css file via brotli: https://www.npmjs.com/package/brotli as recommended by tailwindcss docs: https://tailwindcss.com/docs/optimizing-for-production

  - [ ] Perhaps add a "dev" version? umich-lib.development.css as the uncompressed options.
