/**
 * Transform:
 *  - @umich-lib/components/dist/docs.json
 *  - @umich-lib/css/dist/tokens.json
 *
 *  For use with Elenvety _data/
 */

const fs = require("fs");

function callback(err) {
  if (err) throw err;
}

function processDocs() {
  const docs = require("@umich-lib/components/dist/docs.json");

  const flattened = docs.components.reduce((memo, component) => {
    // If the component has the `private` doc tag, then skip it.
    const isPublic = !component.docsTags.find((tag) => tag.name === "private");

    if (isPublic) {
      const tags = component.docsTags.reduce((acc, tag) => {
        return Object.assign(acc, { [tag.name]: tag.text });
      }, {});

      const props = component.props.length > 0 ? component.props : null;

      memo = memo.concat({
        ...tags,
        tag: component.tag,
        props,
      });
    }

    return memo;
  }, []);

  fs.writeFile(
    "_data/components.json",
    JSON.stringify(flattened, null, 2),
    "utf8",
    callback
  );
}

processDocs();

/**
 * Make a color.json and space.json data file.
 */

function processTokens() {
  const tokens = require("@umich-lib/css/dist/tokens.json");
  const color = tokens.props.filter((prop) => prop.category === "color");

  fs.writeFile(
    "_data/color.json",
    JSON.stringify(color, null, 2),
    "utf8",
    callback
  );

  const space = tokens.props.filter((prop) => prop.category === "space");
  fs.writeFile(
    "_data/space.json",
    JSON.stringify(space, null, 2),
    "utf8",
    callback
  );
}

processTokens();
