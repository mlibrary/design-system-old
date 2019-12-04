const { src, dest, parallel, watch } = require("gulp");
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

function styles() {
  return src("src/build.scss")
    .pipe(sass())
    .pipe(dest("dist/"));
}

const watcher = watch(["src/**/*"]);

watcher.on("change", function() {
  build();
});

const build = parallel(styles);

exports.default = build;
