# The CSS Framework

Design tokens are the design glossary for our Design System. Design tokens allow us to store values in one place and then they are transformed into different formats for distribution. We use these tokens like we would use variables, to allow for a single source of truth.

We use [Theo](https://github.com/salesforce-ux/theo) to transform and format our design tokens.

## Quick start development

If you haven't already, from the root, run:

`npm start` to start the Gulp build and watch

## Adding new design tokens

All changes and updates for the framework begin with the Design Tokens. To avoid conflicts, make all changes in the main tokens file.

Design token values are held in `src/tokens.json`. We use the following format:

```
{
  props: [
    {
      "theme": "prop-theme",
      "name": "prop-name",
      "category": "prop-category",
      "value": "prop-value",
      "type": "prop-type"
    }
  ]
}

```

Example:

```
  {
      "theme": "maize",
      "name": "color-maize-100",
      "category": "color",
      "value": "#FFF9E6"
    }
```

See supported [Theo categories](https://github.com/salesforce-ux/theo#supported-categories)

### Transform the tokens

Theo translates Hex values to RGB for the web. This has been added to the `gulpfile.js`.

### Format the tokens

The `tokens.json` file formats to `scss/_tokens.scss` and `scss/_custom-properties.scss`.

### Tokens join the pipeline

The `_tokens.scss` and `_custom-properties.scss` files are fed into the gulp build for `scss/main.scss`, along with some base styling and utilities.

```
/scss
 - _base.scss
 - _custom-properties.scss
 - _tokens.scss
 - _utilities.scss
 - main.scss
```

The Gulp build distributes this to `umich-lib.css` in the `dist` folder.

```
/dist
 - umich-lib.css
```

## Publish

TBD  
-Distribute the min.css and .css via NPM and CDN  
-Distribute the design tokens via NPM
