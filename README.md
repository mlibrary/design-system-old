# University of Michigan Library Design System

The design system exists to build trust in our digital services and create components and standards that are reusable, equitable, informed by research, and available to the public.

Are you trying to find [design system documentation](https://design-system.lib.umich.edu)?

## What tools are used and why?

To be able to contribute to the design system as a developer, it's important to first have an understand of the core tooling:

- [**Theo**](https://github.com/salesforce-ux/theo) is an abstraction for transforming and formatting Design Tokens. Used to manage our single source of truth for design values, such as colors and spacings.

- [**Stencil**](https://stenciljs.com/docs/introduction) is a compiler that generates Web Components (more specifically, Custom Elements). We use this to create ready-to-go solutions like with our [Universal Header Web Component](https://design-system.lib.umich.edu/universal-header/).

- [**PostCSS**](https://postcss.org/) for improving the developer experience when writing styles with plugins like [postcss-nesting](https://recordit.co/71o05ZKvNf) and optimizing and transforming CSS for distribution.

- [**Eleventy**](https://www.11ty.dev/) is a static site generator that is fairly simple, but powerful enough to use for our [design system website](design-system.lib.umich.edu).

- [**Gulp**](https://gulpjs.com/) for automating our development workflows and build pipelines.

### How do I get started?

```sh
$ npm start
```

[this section is to be written]
