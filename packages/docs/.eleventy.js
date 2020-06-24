const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function(eleventyConfig) {
  // Copy `css/` to `_site/css/`.
  eleventyConfig.addPassthroughCopy("css");

  // Enable the `@11ty/eleventy-navigation` plugin.
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
};
