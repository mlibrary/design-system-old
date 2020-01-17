# University of Michigan Library Icons

This package includes U-M Library Icons and related tools.

## Usage

The recommended way to use U-M Library Icons is through our npm package. To install, simply run:

```
npm install @umich-lib/icons
```

The API can then be used as follows

```
import icons from "@umich-lib/icons"

/*
{
  title: 'search',
  svg: '<svg viewBox="0 0 24 24" ...'
}
*/
```

## CDN usage

Icons can also be served from a CDN such as JSDelivr or Unpkg, but this should be only used for prototyping purposes. To use the @umich-lib/icons npm package and specify a version in the URL like the following:

```
<img height="24" width="24" src="https://cdn.jsdelivr.net/npm/@umich-lib/icons/lib/assets/[ICON NAME].svg" />
<img height="24" width="24" src="https://unpkg.com/@umich-lib/icons/lib/assets/[ICON NAME].svg" />
```

Where [ICON NAME] is replaced by the icon name, for example:

```
<img height="24" width="24" src="https://cdn.jsdelivr.net/npm/@umich-lib/icons/lib/assets/search.svg" />
<img height="24" width="24" src="https://unpkg.com/@umich-lib/icons/lib/assets/search.svg" />
```

See [University of Michigan Library Design System documentation](https://design-system.lib.umich.edu/iconography).

TBD

## Credit

All icons are sourced from [Google's Material Design icons](https://material.io/resources/icons/).
