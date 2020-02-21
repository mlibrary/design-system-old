import { Config } from "@stencil/core";
import { reactOutputTarget } from "@stencil/react-output-target";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "umich-lib",
  globalStyle: "./node_modules/@umich-lib/css/dist/umich-lib.css",
  outputTargets: [
    reactOutputTarget({
      componentCorePackage: "@umich-lib/components",
      proxiesFile: "../react/src/components.ts"
    }),
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
  ],
  plugins: [
    sass({
      includePaths: ["./node_modules/@umich-lib/css/dist"]
    })
  ]
};
