const { src, dest, watch, series } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");
const browsersync = require("browser-sync").create();
const del = require("del");

function clean() {
  return del(["dist/**", "!dist"], { force: true });
}
clean.description = "Delete distribution directory ('dist/**') and files.";

function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
        format: { type: "custom-properties.css" },
      })
    )
    .pipe(dest("dist"));
}
tokens.description =
  "Build CSS custom properties from design-tokens.json with Theo.";

function css() {
  return src("css/*.css")
    .pipe(
      postcss({
        plugins: [
          require("postcss-import"),
          require("postcss-nesting"),
          require("autoprefixer"),
          require("cssnano"),
        ],
      })
    )
    .pipe(dest("dist"));
}
css.description = "Build umich-lib.css with PostCSS.";

function browser(cb) {
  browsersync.init({
    server: {
      baseDir: "./",
      index: "developer-workshop.html",
    },
  });
  cb();
}
browser.description = "Start the developer workshop webpage.";

function reload(cb) {
  browsersync.reload();
  cb();
}
reload.description = "Reload the developer workshop webpage.";

function watcher() {
  watch("css/*.css", series(clean, tokens, css, reload));
  watch("developer-workshop.html", reload);
  watch("design-tokens.json", series(clean, tokens, css, reload));
}

exports.default = series(clean, tokens, css, browser, watcher);
