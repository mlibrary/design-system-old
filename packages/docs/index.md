---
layout: layout.njk
eleventyNavigation:
  key: Getting started
  order: 0
---

# Getting started

The University of Michigan Library Design System aims to provide resources for designers and developers to build high quality and inclusive U-M Library websites that work well for everyone.

The Design System is divided into versioned front-end packages. This means the [Design System team](/support#design-system-team) can maintain those packages independently from the website that uses them.

Provided packages include:

- CSS
- Components

### CSS

Include the CSS link tag to the `<head>`. This will make design tokens available as custom properties (aka CSS variables).

```html
<link
  href="https://unpkg.com/@umich-lib/css@v1/dist/umich-lib.css"
  rel="stylesheet"
/>
```

### Components

You can start using the components immediately by adding these script tags to the `<head>`:

```html
<script
  type="module"
  src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.esm.js"
></script>
<script
  nomodule
  src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.js"
></script>
```

Browsers that support modules will load the first, while older browsers will load the second, bundled version.

Once included, components can be used in your markup like any other regular HTML elements. Only components that are actually used will be loaded.

```html 9-4
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Basic Template | University of Michigan Library</title>

    <link
      href="https://unpkg.com/@umich-lib/css@v1/dist/umich-lib.css"
      rel="stylesheet"
    />
    <script
      type="module"
      src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.esm.js"
    ></script>
    <script
      nomodule
      src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.js"
    ></script>
  </head>
  <body>
    <m-universal-header></m-universal-header>

    <!-- your website content -->

    <m-chat></m-chat>
  </body>
</html>
```

[Edit this example in CodeSandbox](https://codesandbox.io/s/umich-libcomponents-and-umich-libcss-with-unpkg-468rj?fontsize=14&hidenavigation=1&theme=dark)
