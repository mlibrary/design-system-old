const { src, dest, parallel } = require("gulp");
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

function css() {
  return src("src/build.scss")
    .pipe(sass())
    .pipe(dest("dist/"));
}

exports.default = parallel(css);
