const { src, dest, watch, series } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");

/**
 * Theo processes our Design Tokens into
 * formats we need, such as CSS custom properties.
 * 
 * It generates a file at the root.
 */
function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
        format: { type: "custom-properties.css" },
      })
    )
    .pipe(dest("."));
}

/**
 * For processing our stylesheet and
 * builing it at the project root.
 */
function stylesheets() {
  return src("src/css/umich-lib.css")
    .pipe(postcss())
    .pipe(dest("."));
}

/**
 * If a Design Token is changed, we want to
 * watch for that and make sure it makes it
 * into the published stylesheet.
 */
function watcher() {
  watch("design-tokens.json", series(tokens));
  watch("src/css/*.css", series(stylesheets));
}

exports.default = series(tokens, stylesheets, watcher);
