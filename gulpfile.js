const { src, dest, watch, series } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");
const browsersync = require("browser-sync").create();

function css() {
  return src("src/css/*.css")
    .pipe(
      postcss({
        plugins: [require("postcss-nesting"), require("autoprefixer")],
      })
    )
    .pipe(dest("build"));
}

function browser(cb) {
  browsersync.init({
    server: {
      baseDir: "./",
      startPath: "developer-workshop.html",
    },
  });
  cb();
}

function reload(cb) {
  browsersync.reload();
  cb();
}

function changes() {
  watch("src/css/*.css", series(css, reload));
  watch("developer-workshop.html", reload);
}

exports.default = series(css, browser, reload, changes);

/*
function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
      })
    )
    .pipe(dest("build"));
}
*/
