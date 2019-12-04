# The CSS Framework

Design tokens are the design glossary for our Design System. Design tokens allow us to store values in one place and then they are transformed into different formats for distribution. We use these tokens like we would use variables, to allow for a single source of truth.

We use [Theo](https://github.com/salesforce-ux/theo) to transform and format our design tokens.

## Quick Start Development
Please make sure you have Node.js installed on your machine.

`git clone https://github.com/mlibrary/design-system.git`  
`cd design-system`  
`cd packages/css`  
`npm install`

Start the Gulp watch and build  
`npm run start`

To format the design tokens  
`npm run theo`

## Adding new design tokens
Design token values are held in `src/tokens.json`. We use the following format:

```
{
  props: [
    {
      "theme": "prop-theme",
      "name": "prop-name",
      "category": "prop-category",
      "value": "prop-value",
      "type": "prop-type",
      "title": "prop-title",
      "description": "prop-description",
      "status": "prop-status",
    }
  ]
}

```

Example:

```
  {
      "theme": "m-blue",
      "name": "color-primary-maize-100",
      "category": "color",
      "value": "#FFF9E6",
      "type": "color",
      "title": "Maize-100",
      "description": "This is maize-100. Primarily used as a background color, as in the case of the warning alert.",
      "status": "ready"
    }
```

See supported [Theo categories](https://github.com/salesforce-ux/theo#supported-categories)

### Transform the tokens

`--transform web` translates Hex values to RGB for the web. Remove from the package.json `theo` script if you don't want this.

### Format the tokens

The `tokens.json` file formats to `tokens.scss`, `tokens.custom-properties.css`, `tokens.raw.json` by running the following command in the `css` directory:

`npm run theo`

You should see:

```
✏️  scss tokens created at "src/tokens.scss"
✏️  custom-properties.css tokens created at "src/tokens.custom-properties.css"
✏️  raw.json tokens created at "src/tokens.raw.json"
```

### Tokens join the pipeline
The `tokens.scss` file is fed into the gulp build for `build.scss`.

If the gulp build is running and watching, it will automatically update after you run theo.

## Sass build

The `tokens.scss` is imported into `build.scss`

```
/src  
 - _base.scss
 - _utilities.scss
 - build.scss

 ```

The Gulp build distributes this to `build.css` in the `dist` folder. Make sure this folder exists.

```
/dist  
 - build.css
```

## Publish

TBD  
-Distribute the min.css and .css via NPM and CDN  
-Distribute the design tokens via NPM  