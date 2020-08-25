const theo = require("theo");
const fs = require("fs");

const tokensFile = "tokens.json";
const distPath = "dist";

cleanDist();

fs.writeFileSync(distPath + "/" + tokensFile, fs.readFileSync(tokensFile));

// Create formats
createTokensFormat("custom-properties.css", "css");
//createTokensFormat("scss", "scss");
//createTokensFormat("common.js", "js");
//createTokensFormat("json", "json");

/**
 * Create a token format.
 * Docs: https://github.com/salesforce-ux/theo#formats
 *
 * Args:
 * 1. Theo formatType
 * 2. File extension
 */
function createTokensFormat(formatType, extension) {
  theo
    .convert({
      transform: {
        type: "web",
        file: tokensFile,
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
