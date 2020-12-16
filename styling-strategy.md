## Hurdles

- [ ] Provide Tailwind components ( HTML + class(es) ) in the documentation.

  How do we get there?

  1. Add tailwind configured with Tokens and compressed with Brotli to the umich-lib css distributed stylesheet.

  2. Also export the theme in the CSS package.

  3. Make a plain-ol-CSS distribution of the design tokens, will be used with the components.

- [punt!] How do we internally style components?

## Styling components

- Benefits the most from custom properties.
- If we don't use tailwind with components, does that mean we are not eating our own dog food?
- Very likely don't need to use a configured tailwind for each component where you get to use processing things like @apply.

### Ways we could do it:

1. Get the whole dang tailwind output would be put in the shadow dom next to the component, because browsers will know to reuse the big-ol-stylesheet. Technically the simplest? Just copy in the big old stylesheet to the component.

2. Keep using CSS Properties tokens only. Write your BEM or whatever.

3. Generate a purged stencil stylesheet for each component by looking at what classes are used.

## Styling products

- Benefits the most from tailwind? Everyone in products could use the same class names.
- In a product with tailwind and apply.
