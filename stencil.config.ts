import { Config } from '@stencil/core';
import { postcss } from '@stencil/postcss';
import { sass } from '@stencil/sass'

export const config: Config = {
  namespace: 'umich-lib',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    {
      type: 'docs-json',
      file: 'web-component-docs.json'
    },
    { type: 'dist-hydrate-script' }
  ],
  plugins: [
    sass({
      injectGlobalPaths: [
        'design-tokens.custom-properties.css',
      ]
    }),
    postcss({
      injectGlobalPaths: [
        'design-tokens.custom-properties.css',
      ]
    }),
  ]
};
