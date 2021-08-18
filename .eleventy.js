module.exports = function (eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  
  // Pass styles
  eleventyConfig.addPassthroughCopy("umich-lib.css");

  // Pass components
  eleventyConfig.addPassthroughCopy("loader");
  eleventyConfig.addPassthroughCopy("dist");
};
