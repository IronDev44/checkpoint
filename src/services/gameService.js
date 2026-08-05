import { normalizeRawgPayload } from "./rawgAdapter";

const RAWG_PROXY_BASE = "/api/rawg";
const RAWG_RETRY_STATUSES = new Set([502, 503, 504, 522]);

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

export function buildRawgApiUrl(path, params = {}) {
  const searchParams = createSearchParams(params);
  const normalizedPath = getRawgProxyPath(path);
  const query = searchParams.toString();

  return `${RAWG_PROXY_BASE}${normalizedPath}${query ? `?${query}` : ""}`;
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
      const data = contentType.includes("application/json") ? await response.json() : null;

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
          retryable: false,
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

export const GameService = Object.freeze({
  rawg: requestRawg,
  searchGames: (params, options) => requestRawg("/games", params, options),
  getGameDetails: (id, params, options) =>
    requestRawg(`/games/${encodeURIComponent(id)}`, params, options),
  getGameScreenshots: (id, params, options) =>
    requestRawg(`/games/${encodeURIComponent(id)}/screenshots`, params, options),
  getGameMovies: (id, params, options) =>
    requestRawg(`/games/${encodeURIComponent(id)}/movies`, params, options),
  getGameAdditions: (id, params, options) =>
    requestRawg(`/games/${encodeURIComponent(id)}/additions`, params, options),
  getUpcomingGames: (params, options) => requestRawg("/upcoming", params, options),
  getPlatforms: (params, options) => requestRawg("/platforms", params, options),
  getGenres: (params, options) => requestRawg("/genres", params, options),
});

