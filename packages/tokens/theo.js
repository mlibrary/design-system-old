const theo = require("theo");
const fs = require("fs");

const tokensFile = "tokens.json";
const distPath = "dist";

cleanDist();

fs.writeFileSync(distPath + "/" + tokensFile, fs.readFileSync(tokensFile));

theo.registerFormat(
  "scss-custom-properties-mixin",
  `@mixin custom-properties {
  {{#each props as |prop|}}
  --{{stem prop.name}}: {{{prop.value}}};
  {{/each}}
}`
);

// Create formats
createTokensFormat({
  formatType: "custom-properties.css",
  extension: "css",
});
createTokensFormat({
  formatType: "scss-custom-properties-mixin",
  fileName: "custom-properties",
  extension: "scss",
});

/**
 * Create a token format.
 * Docs: https://github.com/salesforce-ux/theo#formats
 *
 * Args:
 * 1. Theo formatType
 * 2. File extension
 */
function createTokensFormat({ formatType, fileName = "tokens", extension }) {
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
      const fileDest = `${distPath}/${fileName}.${extension}`;

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
