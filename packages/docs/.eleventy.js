const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginSass = require("eleventy-plugin-sass");
const pluginTOC = require("eleventy-plugin-nesting-toc");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const stencil = require("@umich-lib/components/hydrate");
const cacheBuster = require("@mightyplow/eleventy-plugin-cache-buster");

module.exports = function(eleventyConfig) {
  // Copy `css/` to `_site/css/`.
  eleventyConfig.addPassthroughCopy("css");

  // Enable plugins.
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight, {
    alwaysWrapLineHighlights: false,
  });
  eleventyConfig.addPlugin(pluginSass);

  // Config options: https://www.npmjs.com/package/eleventy-plugin-nesting-toc#options
  eleventyConfig.addPlugin(pluginTOC, {
    wrapper: "div",
  });

  // Tell the MD processor to add IDs and links to headings.
  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    }).use(markdownItAnchor)
  );

  // Copy everything in static to _site
  eleventyConfig.addPassthroughCopy("static");

  // Server side rendering for @umich-lib/components.
  eleventyConfig.addTransform("ssr", async (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      try {
        const { html } = await stencil.renderToString(content);
        return html;
      } catch (error) {
        return error;
      }
    }
    return content;
  });

  /**
   * eleventy-plugin-cache-buster
   *
   * https://github.com/mightyplow/eleventy-plugin-cache-buster#readme
   *
   * Adding this plugin caused some issues with building on Netlify.
   * Turning it off until we can find time to troubleshoot.
   */
  // eleventyConfig.addPlugin(cacheBuster({}));
};
