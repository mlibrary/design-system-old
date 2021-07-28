const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  
  // Pass styles
  eleventyConfig.addPassthroughCopy("umich-lib.css");
  eleventyConfig.addWatchTarget("umich-lib.css");

  // Pass components
  eleventyConfig.addPassthroughCopy("loader");
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addWatchTarget("loader");
  eleventyConfig.addWatchTarget("dist");
};
