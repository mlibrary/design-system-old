import { Config } from "@stencil/core";

export const config: Config = {
  srcDir: "web/www",
  namespace: "umich-lib",
  buildEs5: 'prod',
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
};
