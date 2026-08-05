import { GAME_SOURCE } from "./gameTypes";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function namesFromRawgList(items, accessor = (item) => item?.name) {
  if (!Array.isArray(items)) return [];

  return items
    .map(accessor)
    .filter(Boolean)
    .map((name) => String(name).trim())
    .filter(Boolean);
}

function rawgPlatformNames(rawgGame = {}) {
  return namesFromRawgList(rawgGame.platforms, (item) => item?.platform?.name || item?.name);
}

export function normalizeRawgGame(rawgGame = {}) {
  const id = rawgGame.id ?? rawgGame.rawgId ?? null;
  const title = cleanText(rawgGame.name || rawgGame.title);
  const cover = cleanText(rawgGame.background_image || rawgGame.image || rawgGame.cover);

  return {
    canonicalId: id ? `${GAME_SOURCE.RAWG}:${id}` : `${GAME_SOURCE.RAWG}:${rawgGame.slug || title}`,
    source: GAME_SOURCE.RAWG,
    sourceIds: { rawg: id },
    title,
    slug: cleanText(rawgGame.slug),
    releaseDate: cleanText(rawgGame.released || rawgGame.releaseDate),
    cover,
    backgroundImage: cover,
    platforms: rawgPlatformNames(rawgGame),
    genres: namesFromRawgList(rawgGame.genres),
    developers: namesFromRawgList(rawgGame.developers),
    publishers: namesFromRawgList(rawgGame.publishers),
    rating: Number.isFinite(Number(rawgGame.rating)) ? Number(rawgGame.rating) : null,
    ratingCount: Number.isFinite(Number(rawgGame.ratings_count))
      ? Number(rawgGame.ratings_count)
      : null,
    metacritic: Number.isFinite(Number(rawgGame.metacritic)) ? Number(rawgGame.metacritic) : null,
    playtime: Number.isFinite(Number(rawgGame.playtime)) ? Number(rawgGame.playtime) : null,
    description: cleanText(rawgGame.description_raw || rawgGame.description),
    website: cleanText(rawgGame.website),
  };
}

export function toRawgCompatibleGame(rawgGame = {}) {
  const normalized = normalizeRawgGame(rawgGame);

  return {
    ...rawgGame,
    id: rawgGame.id ?? rawgGame.rawgId ?? normalized.canonicalId,
    rawgId: rawgGame.rawgId ?? rawgGame.id ?? null,
    canonicalId: normalized.canonicalId,
    source: GAME_SOURCE.RAWG,
    sourceIds: normalized.sourceIds,
    title: normalized.title,
    name: rawgGame.name || normalized.title,
    released: rawgGame.released || normalized.releaseDate,
    background_image: rawgGame.background_image || normalized.backgroundImage,
    image: rawgGame.image || rawgGame.background_image || normalized.cover,
    platformNames: rawgGame.platformNames || normalized.platforms,
    genreNames: rawgGame.genreNames || normalized.genres,
    normalized,
  };
}

function shouldNormalizeRawgGame(value) {
  return Boolean(value && typeof value === "object" && (value.id || value.slug) && value.name);
}

export function normalizeRawgPayload(payload, path = "") {
  if (!payload || typeof payload !== "object") return payload;

  if (Array.isArray(payload.results)) {
    const normalizedPath = String(path);
    const shouldNormalizeResults =
      normalizedPath.includes("/games") ||
      normalizedPath.includes("/upcoming") ||
      normalizedPath.includes("/search") ||
      normalizedPath.includes("/additions");

    if (!shouldNormalizeResults) return payload;

    return {
      ...payload,
      results: payload.results.map((game) =>
        shouldNormalizeRawgGame(game) ? toRawgCompatibleGame(game) : game
      ),
    };
  }

  if (shouldNormalizeRawgGame(payload)) {
    return toRawgCompatibleGame(payload);
  }

  return payload;
}
