const fs = require("fs");
const maize = require("./tailwind-theme-maize.js");

fs.writeFile(
  "./dist/tailwind-theme-maize.json",
  JSON.stringify(maize, null, 2),
  function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The tailwind Maize theme was saved!");
  }
);
