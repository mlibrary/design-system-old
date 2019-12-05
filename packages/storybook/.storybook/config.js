import { configure } from "@storybook/html";

import "@umich-lib/css/dist/umich-lib.css";

configure(require.context("../src", true, /\.stories\.js$/), module);
