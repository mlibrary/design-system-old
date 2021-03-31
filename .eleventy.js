const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  
  // Copy everything in static to _site
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("static");

  // To handle the service worker.
  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addWatchTarget("css");
};
