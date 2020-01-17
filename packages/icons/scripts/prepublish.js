/*
  This is to build the `icons.js` main file that will have
  all icons available for importing.
*/

const fs = require("fs");
const path = require("path");
const directoryPath = path.join(__dirname, "../svgs/");

fs.readdir(directoryPath, function(error, files) {
  if (error) {
    return console.log("Unable to read directory");
  }

  const icons = files.reduce((acc, fileName) => {
    const filePath = path.join(directoryPath, fileName);
    const file = fs.readFileSync(filePath, "utf8");

    return {
      ...acc,
      [fileName]: {
        name: fileName,
        svg: file
      }
    };
  }, {});

  const iconsFile = `module.exports=${JSON.stringify(icons)};`;
  fs.writeFileSync(`../dist/icons.js`, iconsFile);
});
