const { src, dest, watch, parallel } = require("gulp");
const postcss = require("gulp-postcss");
const theo = require("gulp-theo");

const bs = require("browser-sync").create();
function update() {
  bs.reload();
}
bs.watch("src/css/*.css").on("change", update);
bs.watch("developer-workshop.html").on("change", update);
bs.init({
  server: "./",
  startPath: "developer-workshop.html",
});

function css() {
  return src("src/css/*.css")
    .pipe(
      postcss({
        plugins: [require("postcss-nesting"), require("autoprefixer")],
      })
    )
    .pipe(dest("build"));
}

function tokens() {
  return src("design-tokens.json")
    .pipe(
      theo({
        transform: { type: "web" },
      })
    )
    .pipe(dest("build"));
}

function build() {
  return parallel(css, tokens);
}

watch(
  ["src/css/*.css", "developer-workshop.html", "design-tokens.json"],
  build
);

exports.build = build;
exports.default = build;
