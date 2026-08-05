import { normalizeRawgPayload } from "./rawgAdapter";
import { normalizeIgdbPayload } from "./igdbAdapter";

const RAWG_PROXY_BASE = "/api/rawg";
const IGDB_PROXY_BASE = "/api/igdb";
const RAWG_RETRY_STATUSES = new Set([502, 503, 504, 522]);
const RAWG_FALLBACK_CODES = new Set([
  "RAWG_522",
  "RAWG_TIMEOUT",
  "RAWG_NETWORK_ERROR",
  "RAWG_INVALID_RESPONSE",
  "RAWG_UNAVAILABLE",
]);

function createSearchParams(params = {}) {
  if (params instanceof URLSearchParams) return new URLSearchParams(params);
  return new URLSearchParams(params);
}

function getRawgProxyPath(path) {
  if (path === "/games") return "/games";
  if (path === "/platforms") return "/platforms";
  if (path === "/genres") return "/genres";
  return path.startsWith("/") ? path : `/${path}`;
}

function buildProxyUrl(base, path, params = {}) {
  const searchParams = createSearchParams(params);
  const query = searchParams.toString();
  return `${base}${path}${query ? `?${query}` : ""}`;
}

export function buildRawgApiUrl(path, params = {}) {
  const searchParams = createSearchParams(params);
  const normalizedPath = getRawgProxyPath(path);
  const query = searchParams.toString();

  return `${RAWG_PROXY_BASE}${normalizedPath}${query ? `?${query}` : ""}`;
}

export function buildIgdbApiUrl(path, params = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return buildProxyUrl(IGDB_PROXY_BASE, normalizedPath, params);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RawgRequestError extends Error {
  constructor(message, { status = 0, code = "RAWG_ERROR", retryable = false } = {}) {
    super(message);
    this.name = "RawgRequestError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

export class GameSourceError extends Error {
  constructor(message, { source = "unknown", code = "GAME_SOURCE_ERROR", status = 0 } = {}) {
    super(message);
    this.name = "GameSourceError";
    this.source = source;
    this.code = code;
    this.status = status;
  }
}

function getRawgErrorMessage(status) {
  if (status === 522) {
    return "RAWG est temporairement indisponible : Cloudflare n'arrive pas a joindre son serveur d'origine.";
  }

  if (status === 429) {
    return "RAWG limite temporairement les requetes. Reessaie dans un moment.";
  }

  if (status >= 500) {
    return "RAWG est temporairement indisponible.";
  }

  return `RAWG a renvoye une erreur HTTP ${status}.`;
}

export async function requestRawg(path, params = {}, options = {}) {
  const {
    timeout = 8000,
    retries = 2,
    retryDelay = 450,
    signal,
    allowUnavailablePayload = false,
    normalize = true,
  } = options;
  const url =
    typeof path === "string" && path.startsWith("/api/rawg")
      ? path
      : buildRawgApiUrl(path, params);

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const abortRelay = () => controller.abort();

    try {
      if (signal) {
        if (signal.aborted) controller.abort();
        signal.addEventListener("abort", abortRelay, { once: true });
      }

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new RawgRequestError("RAWG a renvoye une reponse non JSON.", {
          code: "RAWG_INVALID_RESPONSE",
          retryable: true,
        });
      }

      let data = null;
      try {
        data = await response.json();
      } catch (error) {
        throw new RawgRequestError("RAWG a renvoye un JSON invalide.", {
          code: "RAWG_INVALID_RESPONSE",
          retryable: true,
        });
      }

      if (!response.ok) {
        throw new RawgRequestError(getRawgErrorMessage(response.status), {
          status: response.status,
          code: response.status === 522 ? "RAWG_522" : "RAWG_HTTP_ERROR",
          retryable: RAWG_RETRY_STATUSES.has(response.status),
        });
      }

      if (data?.sourceStatus === "unavailable" && !allowUnavailablePayload) {
        const status = Number(data.status || data.upstreamStatus || 0);
        throw new RawgRequestError(
          data.message || data.error || getRawgErrorMessage(status || 503),
          {
            status,
            code: data.code || "RAWG_UNAVAILABLE",
            retryable: RAWG_RETRY_STATUSES.has(status),
          }
        );
      }

      return normalize ? normalizeRawgPayload(data, url) : data;
    } catch (error) {
      lastError = error;
      if (error?.name === "AbortError") {
        lastError = new RawgRequestError("RAWG n'a pas repondu assez vite.", {
          code: "RAWG_TIMEOUT",
          retryable: true,
        });
      } else if (!(lastError instanceof RawgRequestError)) {
        lastError = new RawgRequestError("RAWG est temporairement indisponible.", {
          code: "RAWG_NETWORK_ERROR",
          retryable: true,
        });
      }

      const shouldRetry =
        attempt < retries &&
        lastError instanceof RawgRequestError &&
        lastError.retryable;

      if (!shouldRetry) {
        throw lastError;
      }

      await wait(retryDelay * (attempt + 1));
    } finally {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener("abort", abortRelay);
    }
  }

  throw lastError;
}

export async function fetchJsonWithTimeout(url, timeout = 8000) {
  return requestRawg(url, {}, { timeout });
}

function isRawgTemporaryFailure(error) {
  if (!(error instanceof RawgRequestError)) return false;
  if (RAWG_FALLBACK_CODES.has(error.code)) return true;
  return RAWG_RETRY_STATUSES.has(Number(error.status));
}

function parseProxyRequest(path, params = {}) {
  const url =
    typeof path === "string" && path.startsWith("/api/")
      ? new URL(path, window.location.origin)
      : null;
  const searchParams = url ? url.searchParams : createSearchParams(params);
  const pathname = url ? url.pathname : buildRawgApiUrl(path, {}).split("?")[0];

  return { pathname, searchParams };
}

function getIgdbIdFromPathname(pathname) {
  const match = pathname.match(/\/api\/rawg\/games\/([^/]+)/);
  if (!match) return null;
  const id = decodeURIComponent(match[1]);
  return id.startsWith("igdb:") ? id.slice(5) : null;
}

function buildIgdbFallbackUrl(path, params = {}) {
  const { pathname, searchParams } = parseProxyRequest(path, params);
  const igdbId = getIgdbIdFromPathname(pathname);

  if (igdbId) {
    const childMatch = pathname.match(/\/api\/rawg\/games\/[^/]+\/([^/]+)$/);
    const childPath = childMatch ? `/${childMatch[1]}` : "";
    return buildIgdbApiUrl(`/games/${encodeURIComponent(igdbId)}${childPath}`, searchParams);
  }

  if (pathname === "/api/rawg/games" || pathname === "/api/rawg/search") {
    return buildIgdbApiUrl("/games", searchParams);
  }

  if (pathname === "/api/rawg/upcoming") {
    return buildIgdbApiUrl("/upcoming", searchParams);
  }

  return null;
}

async function requestIgdb(path, params = {}, options = {}) {
  const { timeout = 8000, signal, normalize = true } = options;
  const url =
    typeof path === "string" && path.startsWith("/api/igdb")
      ? path
      : buildIgdbApiUrl(path, params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const abortRelay = () => controller.abort();

  try {
    if (signal) {
      if (signal.aborted) controller.abort();
      signal.addEventListener("abort", abortRelay, { once: true });
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok || data?.sourceStatus === "unavailable") {
      throw new GameSourceError(data?.message || "IGDB est temporairement indisponible.", {
        source: "igdb",
        code: data?.code || "IGDB_UNAVAILABLE",
        status: response.status,
      });
    }

    return normalize ? normalizeIgdbPayload(data, url) : data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new GameSourceError("IGDB n'a pas repondu assez vite.", {
        source: "igdb",
        code: "IGDB_TIMEOUT",
      });
    }

    if (error instanceof GameSourceError) throw error;

    throw new GameSourceError("IGDB est temporairement indisponible.", {
      source: "igdb",
      code: "IGDB_NETWORK_ERROR",
    });
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", abortRelay);
  }
}

export async function requestGames(path, params = {}, options = {}) {
  const igdbOnlyUrl = buildIgdbFallbackUrl(path, params);
  const isIgdbIdRequest = Boolean(
    igdbOnlyUrl && (String(path).includes("igdb%3A") || String(path).includes("igdb:"))
  );

  if (isIgdbIdRequest) {
    const data = await requestIgdb(igdbOnlyUrl, {}, options);
    return { ...data, meta: { source: "igdb", fallbackUsed: true, stale: false } };
  }

  try {
    const data = await requestRawg(path, params, options);
    return {
      ...data,
      meta: { ...(data?.meta || {}), source: "rawg", fallbackUsed: false, stale: false },
    };
  } catch (rawgError) {
    const fallbackUrl = buildIgdbFallbackUrl(path, params);

    if (!fallbackUrl || !isRawgTemporaryFailure(rawgError)) {
      throw rawgError;
    }

    try {
      const data = await requestIgdb(fallbackUrl, {}, options);
      return {
        ...data,
        sourceStatus: "ok",
        meta: { ...(data?.meta || {}), source: "igdb", fallbackUsed: true, stale: false },
      };
    } catch (igdbError) {
      throw new GameSourceError("RAWG et IGDB sont temporairement indisponibles.", {
        source: "fallback",
        code: "GAME_SOURCES_UNAVAILABLE",
        status: igdbError.status || rawgError.status || 0,
      });
    }
  }
}

export const GameService = Object.freeze({
  rawg: requestGames,
  igdb: requestIgdb,
  searchGames: (params, options) => requestGames("/games", params, options),
  getGameDetails: (id, params, options) =>
    requestGames(`/games/${encodeURIComponent(id)}`, params, options),
  getGameScreenshots: (id, params, options) =>
    requestGames(`/games/${encodeURIComponent(id)}/screenshots`, params, options),
  getGameMovies: (id, params, options) =>
    requestGames(`/games/${encodeURIComponent(id)}/movies`, params, options),
  getGameAdditions: (id, params, options) =>
    requestGames(`/games/${encodeURIComponent(id)}/additions`, params, options),
  getUpcomingGames: (params, options) => requestGames("/upcoming", params, options),
  getPlatforms: (params, options) => requestRawg("/platforms", params, options),
  getGenres: (params, options) => requestRawg("/genres", params, options),
});
