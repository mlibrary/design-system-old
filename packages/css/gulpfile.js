const gulp = require("gulp");
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

function styles() {
  return gulp
    .src("src/build.scss")
    .pipe(sass())
    .pipe(gulp.dest("dist/"));
}

function watch() {
  gulp.watch("src/**/*", styles);
}

const build = gulp.parallel(watch);

exports.default = build;
