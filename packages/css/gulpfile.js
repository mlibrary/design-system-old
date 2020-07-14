const { src, dest, series, watch, task, parallel } = require("gulp");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const gulpTheo = require("gulp-theo");
const theo = require("theo");

theo.registerFormat(
  "scss-custom-properties-mixin",
  `
@mixin custom-properties {
  {{#each props as |prop|}}
  --{{stem prop.name}}: {{{prop.value}}};
  {{/each}}
}
`
);

sass.compiler = require("node-sass");

task("css:build-dist", function() {
  return src("src/scss/main.scss")
    .pipe(sass())
    .pipe(rename("umich-lib.css"))
    .pipe(dest("dist/"));
});

task("tokens:json", function() {
  return src("src/tokens.json").pipe(dest("dist/"));
});

task("tokens:scss", function() {
  return src("src/tokens.json")
    .pipe(
      gulpTheo({
        transform: { type: "web" },
        format: { type: "scss" },
      })
    )
    .pipe(rename("_tokens.scss"))
    .pipe(dest("src/scss/"));
});

task("tokens:custom-properties", function() {
  return src("src/tokens.json")
    .pipe(
      gulpTheo({
        transform: { type: "web" },
        format: { type: "scss-custom-properties-mixin" },
      })
    )
    .pipe(rename("_custom-properties.scss"))
    .pipe(dest("src/scss"))
    .pipe(rename("custom-properties.scss"))
    .pipe(dest("dist"));
});

const build = series(
  task("tokens:json"),
  task("tokens:scss"),
  task("tokens:custom-properties"),
  task("css:build-dist")
);

exports.default = build;
