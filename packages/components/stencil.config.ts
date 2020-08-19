import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import copy from "rollup-plugin-copy";

export const config: Config = {
  namespace: "umich-lib",
  globalStyle: "./node_modules/@umich-lib/css/dist/umich-lib.css",
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
    },
    {
      type: "dist-hydrate-script" // Server Side Rendering: https://stenciljs.com/docs/hydrate-app#how-to-use-the-hydrate-app
    }
  ],
  plugins: [
    sass({
      includePaths: ["./node_modules/@umich-lib/css/dist"]
    }),
    copy({
      targets: [
        /*
          This is used to copy @umich-lib/css svgs to
          the <m-icon> component as local assets.

          For reference:
          - https://stenciljs.com/docs/custom-elements#making-assets-available
          - https://stenciljs.com/docs/local-assets#local-assets
        
        {
          src: path.resolve(__dirname, "node_modules/@umich-lib/icons/svgs"),
          dest: path.resolve(__dirname, "src/components/icon")
        }
        */
      ]
    })
  ]
};
