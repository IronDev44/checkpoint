import { GameService } from "./gameService";

const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[™®]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const asList = value => Array.isArray(value) ? value : [];

function coverUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    // RAWG backgrounds and IGDB screenshots aren't box covers, even in legacy cover fields.
    if (url.hostname === "media.rawg.io") return "";
    if (url.hostname === "images.igdb.com" && !/\/t_cover_[^/]+\//.test(url.pathname)) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function getKnownGameCover(game = {}) {
  const imageId = game.cover?.image_id;
  if (typeof imageId === "string" && /^[a-zA-Z0-9_-]+$/.test(imageId)) {
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
  }
  for (const value of [game.cover_image, game.coverUrl, game.coverImage, game.cover, game.normalized?.cover]) {
    const url = coverUrl(value);
    if (url) return url;
  }
  // Older IGDB imports stored the actual cover only in image.
  for (const value of [game.image, game.background_image]) {
    if (typeof value === "string" && value.includes("images.igdb.com/")) {
      const url = coverUrl(value);
      if (url) return url;
    }
  }
  return "";
}

function igdbId(game) {
  const explicit = game.sourceIds?.igdb || game.normalized?.sourceIds?.igdb || game.igdbId;
  const prefixed = String(game.canonicalId || game.id || "").match(/^igdb:(\d+)$/)?.[1];
  const id = String(explicit || prefixed || "");
  return /^[1-9]\d*$/.test(id) ? id : "";
}

function releaseYear(game) {
  if (game.first_release_date) return new Date(Number(game.first_release_date) * 1000).getUTCFullYear() || 0;
  return Number(String(game.released || game.releaseDate || "").match(/\b(?:19|20)\d{2}\b/)?.[0]) || 0;
}

export function getCoverPlatformNames(game) {
  const platforms = asList(game.playedPlatforms).length ? game.playedPlatforms : asList(game.platformNames).length ? game.platformNames : asList(game.platforms);
  return platforms.map(platform => typeof platform === "string" ? platform : platform?.platform?.name || platform?.name).filter(Boolean);
}

const platformKey = value => normalize(value).replace(/^ps1$/, "playstation").replace(/^ps([2-5])$/, "playstation $1");

export function selectGameCoverMatch(game, candidates = []) {
  const title = normalize(game.name || game.title);
  const year = releaseYear(game);
  const platforms = getCoverPlatformNames(game).map(platformKey);
  return candidates
    .filter(candidate => normalize(candidate.name || candidate.title) === title && getKnownGameCover(candidate))
    .map(candidate => ({ candidate, year: releaseYear(candidate),
      score: (year && releaseYear(candidate) === year ? 16 : 0) +
        (getCoverPlatformNames(candidate).some(name => platforms.includes(platformKey(name))) ? 8 : 0),
    }))
    .sort((a, b) => b.score - a.score || (a.year || Infinity) - (b.year || Infinity) || Number(a.candidate.id) - Number(b.candidate.id))[0]?.candidate || null;
}

export function getGameCoverKey(game) {
  return JSON.stringify([igdbId(game), normalize(game.name || game.title), releaseYear(game), getCoverPlatformNames(game).map(platformKey).sort(), getKnownGameCover(game)]);
}

export function createGameCoverResolver(request = GameService.igdb) {
  const cache = new Map();
  return function resolve(game) {
    const known = getKnownGameCover(game);
    if (known) return Promise.resolve(known);
    const key = getGameCoverKey(game);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.promise;
    const title = String(game.name || game.title || "").trim();
    const id = igdbId(game);
    if (!title && !id) return Promise.resolve("");
    const entry = { expires: Infinity };
    entry.promise = (async () => {
      try {
        const options = { normalize: false, timeout: 6000 };
        const payload = id
          ? await request(`/games/${id}`, {}, options)
          : await request("/games", { search: title, page_size: 20 }, options);
        return id ? getKnownGameCover(payload) : getKnownGameCover(selectGameCoverMatch(game, payload.results || []) || {});
      } catch {
        return "";
      }
    })().then(url => {
      entry.expires = Date.now() + (url ? 86400000 : 300000);
      return url;
    });
    cache.set(key, entry);
    return entry.promise;
  };
}

export const resolveGameCover = createGameCoverResolver();

export function toPublicFounderGame(game) {
  return {
    id: game.id,
    name: game.name,
    image: game.image || "",
    cover_image: getKnownGameCover(game),
    sourceIds: { ...(igdbId(game) ? { igdb: Number(igdbId(game)) } : {}) },
    released: game.released || game.releaseDate || "",
    platforms: getCoverPlatformNames(game),
    genreNames: asList(game.genreNames),
  };
}
