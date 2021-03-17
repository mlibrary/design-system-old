const { src, dest, watch } = require("gulp");
const postcss = require("gulp-postcss");

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

function build() {
  return css();
}

watch(["src/css/*.css", "developer-workshop.html"], build);

exports.default = build;
