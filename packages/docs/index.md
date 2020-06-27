---
layout: layout.njk
title: Introduction
eleventyNavigation:
  key: Introduction
  order: 0
---

The Design System aims to provide resources for designers and developers to build high quality and inclusive U-M Library websites that work well for everyone.

## Getting Started

The Design System is divided into front-end packages. These tools can be used together or separately depending on your team's needs. Provided packages include:

- CSS
- Components

### CSS

Include the CSS link tag to the `<head>`.

```html
<link
  href="https://unpkg.com/@umich-lib/css/dist/umich-lib.css"
  rel="stylesheet"
/>
```

### Components

U-M Library Design System makes it easy to implement and use its components across any framework or no framework at all. We accomplish this by using standardized web platform APIs and Web Components.

If you’re working on a simple HTML page, you can start using the components immediately by adding these script tags to the `<head>`:

```html
<script
  type="module"
  src="https://unpkg.com/@umich-lib/components/dist/umich-lib/umich-lib.esm.js"
></script>
<script
  nomodule
  src="https://unpkg.com/@umich-lib/components/dist/umich-lib/umich-lib.js"
></script>
```

Once included, components can be used in your markup like any other regular HTML elements:

```html 9-4
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Basic Template | University of Michigan Library</title>

    <link
      href="https://unpkg.com/@umich-lib/css/dist/umich-lib.css"
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

[![Edit @umich-lib/components and @umich-lib/css with unpkg](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/umich-libcomponents-and-umich-libcss-with-unpkg-468rj?fontsize=14&hidenavigation=1&theme=dark)

## Design System Principles

A set of principles underpins all our design decisions and guides us when we need to make hard choices. This criteria is what makes good design at U-M Library and all design patterns are evaluated against it.

### 1. Backed by research

Understanding user needs is central. Our design, development, and content efforts must be based on what real users need — what they need to do, what they need to know, and what challenges they may need to overcome. Decisions will be informed by research and by best practices and standards.

### 2. Simple

Less is more. Our visual style is clean and understated. We help users stay focused by using subtle, unobtrusive graphics, standard controls, and predictable behaviors. We offer users a well thought-out path, rather than overwhelming them with choice.

### 3. Robust

Anyone should be able to understand and use our interfaces. Our sites are intuitive, flexible, and resilient. And when we say 'anyone', we mean it. Our products and visual language should be welcoming and accessible for all users, regardless of their age, gender, or device.
