---
layout: layout.njk
title: Components
eleventyNavigation:
  key: Components
  order: 2
---

The Design System makes it easy to implement and use its components across any framework or no framework at all. We accomplish this by using standardized web platform APIs and Web Components.

## Installation

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

## Components

### Universal Header

The Universal Header component provides a quick and organized way for users to access other Library websites. It should be used on every U-M Library Website.

```html
<m-universal-header></m-universal-header>
```

#### Examples

- design-system.lib.umich.edu
- preview.lib.umich.edu
- publishing.umich.edu

### Chat

The Chat component provides Ask a Librarian services to help users with library and research-related questions.

```html
<m-chat></m-chat>
```

#### Examples

- preview.lib.umich.edu
