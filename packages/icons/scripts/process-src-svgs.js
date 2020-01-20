/*
  # SVG processing script
  A script to process all the SVGs that have been downloaded
  from Google's Material Design Icon set.

  ## What
  The goal is to strip the xmlns="...", width, and height attributes.
  And add the following attributes: fill="currentColor" and role="presentation",
  so that the icon inherits its color from its parent and the icon is considered
  only for presentation purposes; a label can be applied by wrapping the svg.

  ## Why
  Why not use SVG title? Support for svg title, desc, and text is mixed across browsers.
  So we suggest using the SVG as purely presentation and applying a label outside the SVG.

  ### eg:
  <p class="visually-hidden">Search</p>
  <m-icon name="search"></m-icon>

  ## Result

  ### Input:
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.52 21.48C4.25 19.94 ..."/></svg>

  ### Output:
  <svg fill="currentColor" role="presentation" viewBox="0 0 24 24"><path d="M7.52 21.48C4.25 19.94 ..."/></svg>
*/

const fs = require("fs");
const path = require("path");
const sourcePath = path.join(__dirname, "../src-svgs/");
const distPath = path.join(__dirname, "../svgs/");

fs.readdir(sourcePath, function(error, files) {
  if (error) {
    return console.log("Unable to read directory");
  }
  files.forEach(function(fileName) {
    const filePath = path.join(sourcePath, fileName);
    const file = fs.readFileSync(filePath, "utf8");
    const processedFile = file.replace(
      `xmlns="http://www.w3.org/2000/svg" width="24" height="24"`,
      `role="presentation" width="16" height="16" fill="currentColor" data-m-icon-svg=""`
    );

    const distName = fileName
      .replace("ic_", "")
      .replace("_24px", "")
      .split("_")
      .join("-");

    fs.writeFile(path.join(distPath, distName), processedFile, "utf8", function(
      error
    ) {
      if (error) {
        return console.log("Unable to write file", error);
      }
    });
  });
});
