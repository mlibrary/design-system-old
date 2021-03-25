import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "umich-lib",
  srcDir: "components",
  outputTargets: [
    {
      type: 'dist',
      dir: 'build'
    },
    {
      type: "dist-hydrate-script", // Server Side Rendering: https://stenciljs.com/docs/hydrate-app#how-to-use-the-hydrate-app
    },
  ],
};
