import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "umich-lib",
  globalStyle: "./node_modules/@umich-lib/css/dist/umich-lib.css",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "docs-readme",
    },
    {
      type: "www",
      serviceWorker: null, // disable service workers
    },
    {
      type: "dist-hydrate-script", // Server Side Rendering: https://stenciljs.com/docs/hydrate-app#how-to-use-the-hydrate-app
    },
  ],
  plugins: [
    sass({
      /*
        Access to custom-properties.scss mixin, eg:

        // component-name.scss
        @import 'custom-properties';

        :host {
          @include custom-properties;
        }
      */
     includePaths: [
        "./node_modules/@umich-lib/tokens/dist/"
      ]
    })
  ]
};
