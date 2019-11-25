import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "components",
  globalStyle: "./node_modules/@umich-lib/css/dist/build.css",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader"
    },
    {
      type: "docs-readme"
    },
    {
      type: "www",
      serviceWorker: null // disable service workers
    }
  ]
};
