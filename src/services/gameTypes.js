export const GAME_SOURCE = Object.freeze({
  RAWG: "rawg",
  IGDB: "igdb",
  LOCAL: "local",
});

/**
 * @typedef {Object} NormalizedGame
 * @property {string} canonicalId
 * @property {string} source
 * @property {Object<string, string|number|null>} sourceIds
 * @property {string} title
 * @property {string} slug
 * @property {string} releaseDate
 * @property {string} cover
 * @property {string} backgroundImage
 * @property {string[]} platforms
 * @property {string[]} genres
 * @property {string[]} developers
 * @property {string[]} publishers
 * @property {number|null} rating
 * @property {number|null} ratingCount
 * @property {number|null} metacritic
 * @property {number|null} playtime
 * @property {string} description
 * @property {string} website
 */

