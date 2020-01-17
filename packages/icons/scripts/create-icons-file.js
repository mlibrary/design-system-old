/*
  This is to create the `icons.js` main file that will have
  all icons available for importing.
*/

const fs = require("fs");
const path = require("path");
const directoryPath = path.join(__dirname, "../svgs/");
const distPath = path.join(__dirname, "../dist/icons.js");

fs.readdir(directoryPath, function(error, files) {
  if (error) {
    return console.log("Unable to read directory");
  }

  const icons = files.reduce((acc, fileName) => {
    const name = fileName
      .replace(".svg", "")
      .split("_")
      .join("-");
    const filePath = path.join(directoryPath, fileName);
    const file = fs.readFileSync(filePath, "utf8");

    // Build the large JavaScript file that contains
    // all the icons.
    return {
      ...acc,
      [name]: {
        name,
        svg: file
      }
    };
  }, {});

  const iconsFile = `const icons=${JSON.stringify(
    icons
  )};export default icons;`;
  fs.writeFileSync(distPath, iconsFile, "utf8");
});
