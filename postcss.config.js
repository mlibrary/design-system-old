/**
 * PostCSS documentation:
 * https://github.com/postcss/postcss/blob/main/README.md
 */

console.log("postcss, hello?");

module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-nesting"),
    require("autoprefixer"),
    require("cssnano"),
  ],
};