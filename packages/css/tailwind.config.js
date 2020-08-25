// tailwind.config.js
// Docs: https://tailwindcss.com/docs/configuration
const tokens = require("@umich-lib/tokens/dist/tokens.json");

/*
  Transform token colors into a shape
  that can be passed to Tailwind color config.

  eg:
  {
    'blue': {
      '100': 'var(--color-blue-100)',
      '200': 'var(--color-blue-200)',
      ...
    },
    'maize': {
      ...
    },
    ...
  }
*/
const colors = tokens.props
  .filter((token) => token.category === "color")
  .reduce((acc, token) => {
    const { palette, level } = token.meta;

    return {
      ...acc,
      [palette]: {
        ...acc[palette],
        [level]: `var(--${token.name})`,
      },
    };
  }, {});

const spacing = tokens.props
  .filter((token) => token.category === "space")
  .reduce((acc, token) => {
    const { level } = token.meta;

    return {
      ...acc,
      [level]: `var(--${token.name})`,
    };
  }, {});

module.exports = {
  theme: {
    colors,
    spacing,
  },
};
