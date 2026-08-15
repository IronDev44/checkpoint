import { GAME_SOURCE } from "./gameTypes";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function namesFromIgdbList(items) {
  return toArray(items)
    .map((item) => item?.name)
    .filter(Boolean)
    .map((name) => String(name).trim())
    .filter(Boolean);
}

function igdbImageUrl(imageId, size = "cover_big") {
  if (!imageId) return "";
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

function releaseDateFromTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function companiesByRole(involvedCompanies, role) {
  return toArray(involvedCompanies)
    .filter((item) => Boolean(item?.[role]))
    .map((item) => item?.company?.name)
    .filter(Boolean);
}

function getPrimaryImage(igdbGame = {}) {
  return (
    igdbImageUrl(igdbGame.cover?.image_id, "cover_big") ||
    igdbImageUrl(igdbGame.artworks?.[0]?.image_id, "screenshot_big") ||
    igdbImageUrl(igdbGame.screenshots?.[0]?.image_id, "screenshot_big")
  );
}

function getWideImage(igdbGame = {}) {
  return (
    igdbImageUrl(igdbGame.artworks?.[0]?.image_id, "screenshot_big") ||
    igdbImageUrl(igdbGame.screenshots?.[0]?.image_id, "screenshot_big")
  );
}

export function normalizeIgdbGame(igdbGame = {}) {
  const id = igdbGame.id ?? null;
  const title = cleanText(igdbGame.name || igdbGame.title);
  const cover = getPrimaryImage(igdbGame);
  const backgroundImage = getWideImage(igdbGame) || cover;

  return {
    canonicalId: id ? `${GAME_SOURCE.IGDB}:${id}` : `${GAME_SOURCE.IGDB}:${igdbGame.slug || title}`,
    source: GAME_SOURCE.IGDB,
    sourceIds: { igdb: id },
    title,
    slug: cleanText(igdbGame.slug),
    releaseDate: releaseDateFromTimestamp(igdbGame.first_release_date),
    cover,
    backgroundImage,
    platforms: namesFromIgdbList(igdbGame.platforms),
    genres: namesFromIgdbList(igdbGame.genres),
    developers: companiesByRole(igdbGame.involved_companies, "developer"),
    publishers: companiesByRole(igdbGame.involved_companies, "publisher"),
    rating: Number.isFinite(Number(igdbGame.total_rating || igdbGame.rating))
      ? Number(igdbGame.total_rating || igdbGame.rating) / 20
      : null,
    ratingCount: Number.isFinite(Number(igdbGame.total_rating_count || igdbGame.rating_count))
      ? Number(igdbGame.total_rating_count || igdbGame.rating_count)
      : null,
    metacritic: null,
    playtime: null,
    description: cleanText(igdbGame.summary || igdbGame.storyline),
    website: "",
    collection: cleanText(igdbGame.collection?.name),
    franchises: namesFromIgdbList(igdbGame.franchises),
    parentGame: igdbGame.parent_game || null,
    versionParent: igdbGame.version_parent || null,
    category: igdbGame.category ?? 0,
  };
}

export function toRawgCompatibleIgdbGame(igdbGame = {}) {
  const normalized = normalizeIgdbGame(igdbGame);
  const compatibleId = normalized.sourceIds.igdb ? `igdb:${normalized.sourceIds.igdb}` : normalized.canonicalId;

  return {
    id: compatibleId,
    rawgId: null,
    canonicalId: normalized.canonicalId,
    source: GAME_SOURCE.IGDB,
    sourceIds: normalized.sourceIds,
    title: normalized.title,
    name: normalized.title,
    slug: normalized.slug,
    released: normalized.releaseDate,
    background_image: normalized.backgroundImage || normalized.cover,
    image: normalized.cover || normalized.backgroundImage,
    cover_image: normalized.cover,
    rating: normalized.rating,
    ratings_count: normalized.ratingCount,
    metacritic: normalized.metacritic,
    playtime: normalized.playtime,
    description_raw: normalized.description,
    description: normalized.description,
    platforms: normalized.platforms.map((name) => ({ platform: { name } })),
    genres: normalized.genres.map((name) => ({ name })),
    developers: normalized.developers.map((name) => ({ name })),
    publishers: normalized.publishers.map((name) => ({ name })),
    short_screenshots: toArray(igdbGame.screenshots).map((screenshot) => ({
      id: screenshot.id,
      image: igdbImageUrl(screenshot.image_id, "screenshot_big"),
    })),
    igdbCategory: normalized.category,
    collection: normalized.collection ? { name: normalized.collection } : null,
    franchises: normalized.franchises.map((name) => ({ name })),
    normalized,
  };
}

export function normalizeIgdbPayload(payload, path = "") {
  if (!payload || typeof payload !== "object") return payload;

  if (Array.isArray(payload.results)) {
    return {
      ...payload,
      results: payload.results.map(toRawgCompatibleIgdbGame),
    };
  }

  if (Array.isArray(payload.screenshots)) {
    return {
      results: payload.screenshots.map((screenshot) => ({
        id: screenshot.id,
        image: igdbImageUrl(screenshot.image_id, "screenshot_big"),
      })),
    };
  }

  if (Array.isArray(payload.videos)) {
    return {
      results: payload.videos.map((video) => ({
        id: video.id,
        name: video.name || "Video",
        data: {
          480: video.video_id ? `https://www.youtube.com/watch?v=${video.video_id}` : "",
          max: video.video_id ? `https://www.youtube.com/watch?v=${video.video_id}` : "",
        },
        preview: "",
      })),
    };
  }

  if (path.includes("/additions")) {
    return { results: [], count: 0, next: null, previous: null };
  }

  return toRawgCompatibleIgdbGame(payload);
}
