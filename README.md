# U-M Library Design System

The University of Michigan Library Design System is a collection of reusable components and tools, guided by clear standards, that can be assembled together to build digital products and experiences.

## Structure

U-M Library Design System is divided into front-end packages. These tools can be used together or separately depending on your team's needs. Provided packages include:

- Components
- CSS
- Icons

## Getting started

### Components

U-M Library Design System makes it easy to implement and use its components across any framework or no framework at all. We accomplish this by using standardized web platform APIs and Web Components.

If you’re working on a simple HTML page, you can start using the components immediately by adding these script tags to the `<head>`:

```
<script type="module" src="https://unpkg.com/@umich-lib/components/dist/umich-lib/umich-lib.esm.js"></script>
<script nomodule src="https://unpkg.com/@umich-lib/components/dist/umich-lib/umich-lib.js"></script>
```

Once included, components can be used in your markup like any other regular HTML elements:

```
<m-icon name="search"></m-icon>
<m-chat></m-chat>
```

### CSS

Get started with the Design System’s CSS that includes a wide range of shorthand utility classes to modify an element’s appearance in your own application.

If you’re working on a simple HTML page, you can start using the CSS immediately by adding these script tags to the `<head>`:

```
<link rel="stylesheet" type="text/css" href="https://unpkg.com/@umich-lib/css@latest/dist/umich-lib.css" media="screen" />
```

### Icons

Icons are used to provide additional meaning or in places where text label doesn’t fit. They communicate messages at a glance and draw attention to important information.

The recommended way to use Icons is through our npm package. To install, simply run:

```
npm install @umich-lib/icons
```

The API can then be used as follows:

```
import icons from "@umich-lib/icons"
console.log(icons["people"]);

/*{
  title: 'action-edit',
  svg: '<svg role="img" viewBox="0 0 24 24" ...'
}*/
```

Icons can also be served from a CDN such as Unpkg. To use the @umich-lib/icons npm package:

```
<img height="16" width="16" src="https://unpkg.com/@umich-lib/icons@latest/svgs/[ICON NAME].svg" />
```

Where [ICON NAME] is replaced by the icon name, for example:

```
<img height="16" width="16" src="https://unpkg.com/@umich-lib/icons@latest/svgs/people.svg" />
```

## Repo Development

```
clone https://github.com/mlibrary/design-system.git
npm install
npm run start
```
