const { src, dest, watch, series } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");

function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
        format: { type: "custom-properties.css" },
      })
    )
    .pipe(dest("src/css/"));
}
function stylesheets() {
  return src("src/css/umich-lib.css")
    .pipe(postcss())
    .pipe(dest("css/"));
}

function watcher() {
  watch("design-tokens.json", series(tokens));
  watch("src/stylesheets/*.css", series(stylesheets));
}

exports.default = series(tokens, stylesheets, watcher);
