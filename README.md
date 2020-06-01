# U-M Library Design System

The University of Michigan Library Design System is a collection of reusable components and tools, guided by clear standards, that can be assembled together to build digital products and experiences.

Are you looking for the [React distribution](https://github.com/mlibrary/umich-lib-ui/)?

## Structure

U-M Library Design System is divided into front-end packages. These tools can be used together or separately depending on your team's needs. Provided packages include:

- Fonts
- Components
- CSS (in development)
- Icons (in development)

## Getting started

### Fonts

Include the Google Fonts link tag to the `<head>`.

```html
<link
  href="https://fonts.googleapis.com/css?family=Crimson+Text|Muli:400,600,700"
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

```html
<m-universal-header></m-universal-header>
<m-chat></m-chat>
```

## Basic Template

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Basic Template | University of Michigan Library</title>

    <link
      href="https://fonts.googleapis.com/css?family=Crimson+Text|Muli:400,600,700"
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

    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <m-universal-header></m-universal-header>
    <m-chat></m-chat>
  </body>
</html>
```

[![Edit @umich-lib/components and @umich-lib/css with unpkg](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/umich-libcomponents-and-umich-libcss-with-unpkg-468rj?fontsize=14&hidenavigation=1&theme=dark)

## Contribute to repo

Clone the repo, install dependencies, and then `npm start` the systems.

```
clone https://github.com/mlibrary/design-system.git
npm install
npm start
```

A Stencil.js page and Storybook should open up in your browser after starting.
