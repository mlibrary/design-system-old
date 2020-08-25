const theo = require("theo");
const fs = require("fs");

const distPath = "dist";

cleanDist();

createTokensFormat("custom-properties.css", "css");
createTokensFormat("scss", "scss");

/**
 * Create a token format.
 * Docs: https://github.com/salesforce-ux/theo#formats
 */
function createTokensFormat(formatType, extension) {
  theo
    .convert({
      transform: {
        type: "web",
        file: "tokens.yml",
      },
      format: {
        type: formatType,
      },
    })
    .then((content) => {
      const fileDest = distPath + "/tokens." + extension;

      try {
        fs.writeFileSync(fileDest, content);
      } catch (err) {
        console.error(err);
      }
    })
    .catch((error) => console.log(`Something went wrong: ${error}`));
}

/*
  Clean `dist/` and leave it empty.
*/
function cleanDist() {
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  } else {
    fs.rmdirSync(distPath, { recursive: true });
    fs.mkdirSync(distPath);
  }
}
