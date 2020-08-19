import { getAssetPath } from "@stencil/core";

const iconCache = {};
const requestCache = {};

/**
 * Fetch icon SVG and do some simple caching.
 * Inspired by: https://paulcpederson.com/articles/stencil-icons/
 */
export async function fetchIcon({ icon }) {
  // Check local cache before fetching.
  if (iconCache[icon]) {
    return iconCache[icon];
  }

  if (!requestCache[icon]) {
    requestCache[icon] = fetch(getAssetPath(`./svgs/${icon}.svg`))
      .then(resp => {
        // validate response.
        if (resp.status === 200) {
          return resp.text();
        }

        // Return null if unable to validate SVG fetch.
        return null;
      })
      .catch(() => {
        console.warn(
          `[U-M Library Design System] Unable to find an icon name of "${icon}". Please check your usage of <m-icon name="${this.name}"></m-icon>.`
        );
        return null;
      });
  }

  const path = await requestCache[icon];
  iconCache[icon] = path;

  return path;
}
