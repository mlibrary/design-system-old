const { src, dest, watch, series } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");
const browsersync = require("browser-sync").create();
const del = require("del");

function clean() {
  return del(["dist", "build"]);
}

function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
        format: { type: "custom-properties.css" },
      })
    )
    .pipe(dest("build/tokens"));
}
function styles() {
  // The PostCSS configuration is loaded
  // automatically from postcss.config.js
  return src("styles/umich-lib.css").pipe(postcss()).pipe(dest("build"));
}

function browser(cb) {
  browsersync.init({
    server: {
      baseDir: "./",
      index: "developer-workshop.html",
    },
  });
  cb();
}

function reload(cb) {
  browsersync.reload();
  cb();
}

function watcher() {
  watch("styles/*.css", series(styles, reload));
  watch("developer-workshop.html", reload);
  watch("design-tokens.json", series(tokens, reload));
}

exports.default = series(clean, tokens, styles, browser, watcher);
