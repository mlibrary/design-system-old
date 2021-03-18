const { src, dest, watch, series } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");
const browsersync = require("browser-sync").create();

function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
        format: { type: "custom-properties.css" },
      })
    )
    .pipe(dest("build"));
}

function css() {
  return src("src/css/*.css")
    .pipe(
      postcss({
        plugins: [
          require("postcss-import"),
          require("postcss-nesting"),
          require("autoprefixer"),
        ],
      })
    )
    .pipe(dest("build"));
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
  watch("src/css/*.css", series(css, reload));
  watch("developer-workshop.html", reload);
  watch("design-tokens.json", series(tokens, css, reload));
}

exports.default = series(tokens, css, browser, reload, watcher);
