# University of Michigan Library Design System

The design system exists to build trust in our digital services and create components and standards that are reusable, equitable, informed by research, and available to the public.

**Are you looking for documentation?**

https://design-system.lib.umich.edu

## What tools are used and why?

To be able to contribute to the design system as a developer, it's important to first have an understand of the core tooling:

- [**Theo**](https://github.com/salesforce-ux/theo) is an abstraction for transforming and formatting Design Tokens. Used to manage our single source of truth for design values, such as colors and spacings.

- [**Stencil**](https://stenciljs.com/docs/introduction) is a compiler that generates Web Components (more specifically, Custom Elements). We use this to create ready-to-go solutions like with our [Universal Header Web Component](https://design-system.lib.umich.edu/universal-header/).

- [**PostCSS**](https://postcss.org/) for optimizing authoring CSS and transforming the CSS to be easily consumed by our websites.

- [**Eleventy**](https://www.11ty.dev/) is a static site generator that is fairly simple, but powerful enough to use for our [design system website](design-system.lib.umich.edu).

- [**Gulp**](https://gulpjs.com/) has been a dependable build tool for automating our development workflow and build pipelines.

### How do I get started?

```
npm start
```

[this section is to be written]
