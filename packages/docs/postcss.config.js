module.exports = {
  plugins: [
    /**
     * Purge unused CSS when building for production,
     * otherwise in development use all the CSS.
     */
    process.env.NODE_ENV === "production" &&
      require("@fullhuman/postcss-purgecss")({
        content: ["_site/**/*.html"],
        defaultExtractor: (content) => content.match(/[A-Za-z0-0-_:]+/g) || [],
      }),
  ],
};
