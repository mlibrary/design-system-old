import { Config } from '@stencil/core';
import { postcss } from '@stencil/postcss';

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
  ],
  plugins: [
    postcss({
      injectGlobalPaths: [
        'src/css/design-tokens.custom-properties.css',
      ]
    })
  ]
};
