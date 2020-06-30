/*
  Transform @umich-lib/components/dist/docs.json to 11ty _data/
*/

const fs = require("fs");
const data = require("@umich-lib/components/dist/docs.json");

function callback(err) {
  if (err) throw err;
  console.log("docs.json saved!");
}

const flattened = data.components.reduce((memo, component) => {
  // If the component has the `private` doc tag, then skip it.
  const isPublic = !component.docsTags.find((tag) => tag.name === "private");

  if (isPublic) {
    const tags = component.docsTags.reduce((acc, tag) => {
      return Object.assign(acc, { [tag.name]: tag.text });
    }, {});

    memo = memo.concat({
      ...tags,
      tag: component.tag,
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
