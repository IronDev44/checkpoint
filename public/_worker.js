const DEFAULT_DEAL_REGION = {
  country: "FR",
  locale: "fr-FR",
  steamLang: "french",
  currency: "EUR",
};

const DEAL_RESULT_LIMIT = 60;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=300, s-maxage=900",
};

const PRIVATE_JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, no-cache, max-age=0, must-revalidate",
};

const RAWG_API_BASE = "https://api.rawg.io/api";
const IGDB_API_BASE = "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const RAWG_RETRY_STATUSES = new Set([502, 503, 504, 522]);
const RAWG_PUBLIC_PARAMS = new Set([
  "search",
  "dates",
  "platforms",
  "genres",
  "ordering",
  "page",
  "page_size",
  "lang",
]);
const IGDB_GAME_FIELDS = [
  "id",
  "name",
  "slug",
  "summary",
  "first_release_date",
  "cover.image_id",
  "platforms.id",
  "platforms.name",
  "genres.id",
  "genres.name",
].join(",");

const IGDB_GAME_DETAIL_FIELDS = [
  IGDB_GAME_FIELDS,
  "artworks.image_id",
  "screenshots.image_id",
  "videos.video_id",
  "videos.name",
  "category",
  "rating",
  "rating_count",
  "total_rating",
  "total_rating_count",
].join(",");

const RAWG_TO_IGDB_PLATFORMS = {
  1: 49,
  3: 39,
  4: 6,
  5: 14,
  6: 3,
  7: 130,
  14: 12,
  16: 9,
  18: 48,
  21: 34,
  187: 167,
  186: 169,
};

const RAWG_TO_IGDB_GENRES = {
  1: 10,
  2: 5,
  3: 31,
  4: 31,
  5: 12,
  6: 4,
  7: 9,
  10: 15,
  11: 33,
  14: 13,
  15: 14,
  17: 35,
  28: 35,
  40: 33,
  51: 32,
  83: 8,
};

let twitchTokenCache = {
  accessToken: "",
  expiresAt: 0,
};

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {}),
    },
  });
}

function privateJsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...PRIVATE_JSON_HEADERS,
      ...(init.headers || {}),
    },
  });
}

async function assetResponse(request, env) {
  const response = await env.ASSETS.fetch(request);
  const url = new URL(request.url);
  const headers = new Headers(response.headers);
  const pathname = url.pathname;
  const isAppShell =
    pathname === "/" ||
    pathname.endsWith(".html") ||
    pathname === "/manifest.json" ||
    pathname === "/asset-manifest.json";

  if (isAppShell) {
    headers.set("cache-control", "no-store, no-cache, max-age=0, must-revalidate");
    headers.set("pragma", "no-cache");
    headers.set("expires", "0");
  } else if (pathname.startsWith("/static/")) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchJson(url, timeout = 9000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent": "Checkpoint/1.0 (gaming deals app)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class RawgUpstreamError extends Error {
  constructor(message, { status = 0, code = "RAWG_UPSTREAM_ERROR", retryable = false } = {}) {
    super(message);
    this.name = "RawgUpstreamError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

function getRawgErrorMessage(status) {
  if (status === 522) {
    return "RAWG est temporairement indisponible : Cloudflare ne parvient pas a joindre son serveur d'origine.";
  }

  if (status === 429) {
    return "RAWG limite temporairement les requetes.";
  }

  if (status >= 500) {
    return "RAWG est temporairement indisponible.";
  }

  return `RAWG a renvoye une erreur HTTP ${status}.`;
}

async function fetchRawgJson(url, { timeout = 12000, retries = 2 } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: "application/json",
          "user-agent": "Checkpoint/1.0 (RAWG proxy)",
        },
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : null;

      if (!response.ok) {
        throw new RawgUpstreamError(getRawgErrorMessage(response.status), {
          status: response.status,
          code: response.status === 522 ? "RAWG_522" : "RAWG_HTTP_ERROR",
          retryable: RAWG_RETRY_STATUSES.has(response.status),
        });
      }

      return payload;
    } catch (error) {
      lastError =
        error?.name === "AbortError"
          ? new RawgUpstreamError("RAWG n'a pas repondu assez vite.", {
              code: "RAWG_TIMEOUT",
              retryable: false,
            })
          : error;

      const shouldRetry =
        attempt < retries &&
        lastError instanceof RawgUpstreamError &&
        lastError.retryable;

      if (!shouldRetry) {
        throw lastError;
      }

      await wait(450 * (attempt + 1));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

function rawgUnavailableResponse(error, extra = {}) {
  const status = error instanceof RawgUpstreamError ? error.status : 0;
  return jsonResponse(
    {
      sourceStatus: "unavailable",
      code: error?.code || "RAWG_UNAVAILABLE",
      upstreamStatus: status || null,
      message: error?.message || "RAWG est temporairement indisponible.",
      updatedAt: new Date().toISOString(),
      ...extra,
    },
    { status: status === 429 ? 429 : 503 }
  );
}

class IgdbUpstreamError extends Error {
  constructor(
    message,
    { status = 0, code = "IGDB_UPSTREAM_ERROR", retryableAuth = false, upstreamMessage = "" } = {}
  ) {
    super(message);
    this.name = "IgdbUpstreamError";
    this.status = status;
    this.code = code;
    this.retryableAuth = retryableAuth;
    this.upstreamMessage = upstreamMessage;
  }
}

function igdbUnavailableResponse(error, extra = {}) {
  const status = error?.status || null;
  return jsonResponse(
    {
      sourceStatus: "unavailable",
      code: error?.code || "IGDB_UNAVAILABLE",
      upstreamStatus: status,
      ...(error?.upstreamMessage ? { upstreamMessage: error.upstreamMessage } : {}),
      message: error?.message || "IGDB est temporairement indisponible.",
      updatedAt: new Date().toISOString(),
      ...extra,
    },
    { status: status && status >= 400 && status < 500 ? 400 : 503 }
  );
}

function getIgdbCredentials(env) {
  const clientId = env.TWITCH_CLIENT_ID || env.IGDB_CLIENT_ID;
  const clientSecret = env.TWITCH_CLIENT_SECRET || env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new IgdbUpstreamError(
      "Les variables TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET manquent dans Cloudflare.",
      { code: "IGDB_CREDENTIALS_MISSING" }
    );
  }

  return { clientId, clientSecret };
}

async function getTwitchAppToken(env, { forceRefresh = false } = {}) {
  const { clientId, clientSecret } = getIgdbCredentials(env);
  const now = Date.now();
  const refreshMarginMs = 5 * 60 * 1000;

  if (
    !forceRefresh &&
    twitchTokenCache.accessToken &&
    twitchTokenCache.expiresAt - now > refreshMarginMs
  ) {
    return twitchTokenCache.accessToken;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.access_token) {
    throw new IgdbUpstreamError("Authentification IGDB indisponible.", {
      status: response.status,
      code: "IGDB_AUTH_FAILED",
    });
  }

  twitchTokenCache = {
    accessToken: data.access_token,
    expiresAt: now + Math.max(Number(data.expires_in || 0) - 60, 60) * 1000,
  };

  return twitchTokenCache.accessToken;
}

async function fetchIgdb(endpoint, query, env, { refreshOnUnauthorized = true, workerRoute = "" } = {}) {
  const { clientId } = getIgdbCredentials(env);
  const token = await getTwitchAppToken(env);
  const response = await fetch(`${IGDB_API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
      Accept: "application/json",
    },
    body: query,
  });

  if (response.status === 401 && refreshOnUnauthorized) {
    twitchTokenCache = { accessToken: "", expiresAt: 0 };
    await getTwitchAppToken(env, { forceRefresh: true });
    return fetchIgdb(endpoint, query, env, { refreshOnUnauthorized: false, workerRoute });
  }

  const responseText = await response.text();
  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json") && responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new IgdbUpstreamError("IGDB a renvoye un JSON invalide.", {
        status: response.status,
        code: "IGDB_INVALID_RESPONSE",
        upstreamMessage: responseText.slice(0, 300),
      });
    }
  }

  if (!response.ok) {
    const upstreamMessage = responseText.slice(0, 300);
    const code =
      response.status === 400 || response.status === 406
        ? "IGDB_BAD_REQUEST"
        : response.status === 401
          ? "IGDB_AUTH_ERROR"
          : response.status === 403
            ? "IGDB_FORBIDDEN"
            : response.status === 429
              ? "IGDB_RATE_LIMIT"
              : response.status >= 500
                ? "IGDB_TEMPORARY_ERROR"
                : "IGDB_HTTP_ERROR";

    console.error("IGDB upstream error", {
      status: response.status,
      endpoint,
      workerRoute,
      upstreamMessage,
    });

    throw new IgdbUpstreamError("IGDB a refuse la requete.", {
      status: response.status,
      code,
      retryableAuth: response.status === 401,
      upstreamMessage,
    });
  }

  return Array.isArray(data) ? data : [];
}

function encodeBase64Url(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value = "") {
  const base64 = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function buildCookie(name, value, requestUrl, options = {}) {
  const url = new URL(requestUrl);
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${options.maxAge ?? 900}`,
  ];

  if (url.protocol === "https:") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function getRawgApiKey(env) {
  const key = env.RAWG_API_KEY || env.RAWG_KEY;

  if (!key) {
    throw new RawgUpstreamError(
      "RAWG_API_KEY manque dans les variables d'environnement Cloudflare.",
      {
        code: "RAWG_KEY_MISSING",
        retryable: false,
      }
    );
  }

  return key;
}

function isForcedRawgFailure(env) {
  return String(env.FORCE_RAWG_FAILURE || "").toLowerCase() === "true";
}

function isFutureReleaseDate(date, referenceDate = new Date()) {
  if (!date) return false;

  const releaseDate = new Date(date);
  if (Number.isNaN(releaseDate.getTime())) return false;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  releaseDate.setHours(0, 0, 0, 0);

  return releaseDate >= today;
}

function isMainRawgGame(game) {
  const name = String(game?.name || "").toLowerCase();
  if (!name) return false;

  const allowedWords = [
    "complete edition",
    "definitive edition",
    "ultimate edition",
    "deluxe edition",
    "gold edition",
    "game of the year",
    "goty",
    "remastered",
    "remake",
    "director's cut",
    "anniversary edition",
    "collection",
    "trilogy",
  ];

  if (allowedWords.some((word) => name.includes(word))) return true;

  const blockedWords = [
    "dlc",
    "season pass",
    "battle pass",
    "expansion",
    "add-on",
    "addon",
    "skin",
    "costume",
    "soundtrack",
    "ost",
    "demo",
    "beta",
  ];

  return !blockedWords.some((word) => name.includes(word));
}

function buildRawgUrl(path, params, env) {
  const rawgUrl = new URL(`${RAWG_API_BASE}${path}`);
  rawgUrl.searchParams.set("key", getRawgApiKey(env));

  params.forEach((value, key) => {
    if (RAWG_PUBLIC_PARAMS.has(key) && value) {
      rawgUrl.searchParams.set(key, value);
    }
  });

  return rawgUrl;
}

function escapeIgdbString(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function timestampFromDate(value, endOfDay = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return Math.floor(date.getTime() / 1000);
}

function mappedIds(csvValue, mapping) {
  return String(csvValue || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => mapping[value])
    .filter(Boolean);
}

function buildIgdbWhere(params, { upcoming = false, includeCategory = true } = {}) {
  const clauses = [];
  const platformIds = mappedIds(params.get("platforms"), RAWG_TO_IGDB_PLATFORMS);
  const genreIds = mappedIds(params.get("genres"), RAWG_TO_IGDB_GENRES);
  const dates = String(params.get("dates") || "").split(",");
  const from = timestampFromDate(dates[0]);
  const to = timestampFromDate(dates[1], true);

  if (upcoming) {
    clauses.push(`first_release_date >= ${Math.floor(Date.now() / 1000)}`);
  } else {
    if (from) clauses.push(`first_release_date >= ${from}`);
    if (to) clauses.push(`first_release_date <= ${to}`);
  }

  if (platformIds.length) {
    clauses.push(`platforms = (${platformIds.join(",")})`);
  }

  if (genreIds.length) {
    clauses.push(`genres = (${genreIds.join(",")})`);
  }

  if (includeCategory) {
    clauses.push("category = (0, 2, 4, 8, 9, 10, 11)");
  }

  return clauses.length ? `where ${clauses.join(" & ")};` : "";
}

function buildIgdbSearchQuery(params, { upcoming = false } = {}) {
  const pageSize = Math.min(Math.max(Number(params.get("page_size")) || Number(params.get("limit")) || 20, 1), 50);
  const page = Math.max(Number(params.get("page")) || 1, 1);
  const offset = (page - 1) * pageSize;
  const search = String(params.get("search") || "").trim();
  const ordering = params.get("ordering") || "";
  const sortClause =
    search && !upcoming
      ? ""
      : upcoming
        ? "sort first_release_date asc;"
        : ordering.includes("released")
          ? "sort first_release_date desc;"
          : "sort total_rating_count desc;";
  const query = [
    `fields ${IGDB_GAME_FIELDS};`,
    search && !upcoming ? `search "${escapeIgdbString(search)}";` : "",
    buildIgdbWhere(params, { upcoming, includeCategory: !search || upcoming }),
    sortClause,
    `limit ${pageSize};`,
    `offset ${offset};`,
  ]
    .filter(Boolean)
    .join(" ");

  return { query, page, pageSize };
}

function proxiedIgdbNextUrl(requestUrl, page, pageSize, count) {
  if (count < pageSize) return null;
  const current = new URL(requestUrl);
  current.searchParams.set("page", String(page + 1));
  return `${current.pathname}${current.search}`;
}

async function getIgdbGames(request, env) {
  const requestUrl = new URL(request.url);
  const { query, page, pageSize } = buildIgdbSearchQuery(requestUrl.searchParams);

  try {
    const results = await fetchIgdb("/games", query, env, { workerRoute: requestUrl.pathname });

    return jsonResponse({
      results,
      count: null,
      next: proxiedIgdbNextUrl(request.url, page, pageSize, results.length),
      previous: page > 1 ? null : null,
      page,
      pageSize,
      hasNextPage: results.length === pageSize,
      sourceStatus: "ok",
      source: "igdb",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return igdbUnavailableResponse(error, {
      results: [],
      count: null,
      next: null,
      previous: null,
    });
  }
}

async function getIgdbUpcoming(request, env) {
  const requestUrl = new URL(request.url);
  const params = new URLSearchParams(requestUrl.searchParams);
  if (!params.get("page_size")) params.set("page_size", params.get("limit") || "40");
  const { query, page, pageSize } = buildIgdbSearchQuery(params, { upcoming: true });

  try {
    const results = await fetchIgdb("/games", query, env, { workerRoute: requestUrl.pathname });

    return jsonResponse({
      results,
      count: results.length,
      next: proxiedIgdbNextUrl(request.url, page, pageSize, results.length),
      previous: null,
      page,
      pageSize,
      hasNextPage: results.length === pageSize,
      sourceStatus: "ok",
      source: "igdb",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return igdbUnavailableResponse(error, {
      results: [],
      count: null,
      next: null,
      previous: null,
    });
  }
}

async function getIgdbGameDetails(request, env, gameId, childPath = "") {
  const safeId = Number(gameId);
  if (!Number.isFinite(safeId)) {
    return jsonResponse({ error: "Invalid IGDB game id" }, { status: 400 });
  }

  const query = `fields ${IGDB_GAME_DETAIL_FIELDS}; where id = ${safeId}; limit 1;`;

  try {
    const requestUrl = new URL(request.url);
    const results = await fetchIgdb("/games", query, env, { workerRoute: requestUrl.pathname });
    const game = results[0] || null;

    if (!game) {
      return jsonResponse({ error: "IGDB game not found" }, { status: 404 });
    }

    if (childPath === "/screenshots") {
      return jsonResponse({
        screenshots: game.screenshots || [],
        sourceStatus: "ok",
        source: "igdb",
      });
    }

    if (childPath === "/movies") {
      return jsonResponse({
        videos: game.videos || [],
        sourceStatus: "ok",
        source: "igdb",
      });
    }

    if (childPath === "/additions") {
      return jsonResponse({
        results: [],
        count: 0,
        next: null,
        previous: null,
        sourceStatus: "ok",
        source: "igdb",
      });
    }

    return jsonResponse({
      ...game,
      sourceStatus: "ok",
      source: "igdb",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return igdbUnavailableResponse(error);
  }
}

function proxyRawgNextUrl(nextUrl, requestUrl) {
  if (!nextUrl) return null;

  try {
    const rawgNext = new URL(nextUrl);
    const current = new URL(requestUrl);
    const proxied = new URL("/api/rawg/search", current.origin);

    rawgNext.searchParams.forEach((value, key) => {
      if (RAWG_PUBLIC_PARAMS.has(key) && key !== "key") {
        proxied.searchParams.set(key, value);
      }
    });

    return `${proxied.pathname}${proxied.search}`;
  } catch (error) {
    return null;
  }
}

async function getRawgSearch(request, env) {
  const requestUrl = new URL(request.url);

  try {
    if (isForcedRawgFailure(env)) {
      throw new RawgUpstreamError("RAWG est desactive pour test.", {
        status: 522,
        code: "RAWG_FORCED_FAILURE",
        retryable: true,
      });
    }

    const rawgUrl = buildRawgUrl("/games", requestUrl.searchParams, env);
    const data = await fetchRawgJson(rawgUrl.toString(), { timeout: 12000 });

    return jsonResponse({
      ...data,
      next: proxyRawgNextUrl(data?.next, request.url),
      sourceStatus: "ok",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return rawgUnavailableResponse(error, {
      count: null,
      next: null,
      previous: null,
    });
  }
}

async function getRawgProxy(request, env, rawgPath) {
  const requestUrl = new URL(request.url);

  try {
    if (isForcedRawgFailure(env)) {
      throw new RawgUpstreamError("RAWG est desactive pour test.", {
        status: 522,
        code: "RAWG_FORCED_FAILURE",
        retryable: true,
      });
    }

    const rawgUrl = buildRawgUrl(rawgPath, requestUrl.searchParams, env);
    const data = await fetchRawgJson(rawgUrl.toString(), { timeout: 12000 });

    return jsonResponse({
      ...data,
      sourceStatus: "ok",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return rawgUnavailableResponse(error);
  }
}

async function getRawgUpcoming(request, env) {
  const requestUrl = new URL(request.url);
  const referenceDate = new Date();
  const startDate = referenceDate.toISOString().split("T")[0];
  const months = Math.min(
    Math.max(Number(requestUrl.searchParams.get("months")) || 18, 1),
    36
  );
  const limit = Math.min(
    Math.max(Number(requestUrl.searchParams.get("limit")) || 40, 5),
    80
  );
  const future = new Date(referenceDate);
  future.setMonth(future.getMonth() + months);
  const endDate = future.toISOString().split("T")[0];
  const collected = [];
  let next = null;

  try {
    if (isForcedRawgFailure(env)) {
      throw new RawgUpstreamError("RAWG est desactive pour test.", {
        status: 522,
        code: "RAWG_FORCED_FAILURE",
        retryable: true,
      });
    }

    for (let page = 1; page <= 4 && collected.length < limit; page += 1) {
      const params = new URLSearchParams({
        dates: `${startDate},${endDate}`,
        ordering: "released",
        page: String(page),
        page_size: "40",
      });
      const rawgUrl = buildRawgUrl("/games", params, env);
      const data = await fetchRawgJson(rawgUrl.toString(), { timeout: 12000 });
      next = data?.next || null;

      (data?.results || []).forEach((game) => {
        const isDuplicate = collected.some((candidate) => candidate.id === game.id);
        if (
          !isDuplicate &&
          game?.name &&
          game.background_image &&
          isMainRawgGame(game) &&
          isFutureReleaseDate(game.released, referenceDate)
        ) {
          collected.push(game);
        }
      });

      if (!next) break;
    }

    collected.sort((a, b) => new Date(a.released) - new Date(b.released));

    return jsonResponse({
      results: collected.slice(0, limit),
      count: collected.length,
      next: null,
      sourceStatus: "ok",
      range: { from: startDate, to: endDate },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return rawgUnavailableResponse(error, {
      count: null,
      next: null,
      range: { from: startDate, to: endDate },
    });
  }
}

function clearCookie(name, requestUrl) {
  return buildCookie(name, "", requestUrl, { maxAge: 0 });
}

async function getXboxCookieKey(env) {
  const secret = env.XBOX_COOKIE_SECRET || env.XBOX_CLIENT_SECRET || "";
  if (!secret || secret.length < 16) {
    throw new Error("XBOX_COOKIE_SECRET manquante ou trop courte dans Cloudflare Pages.");
  }

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptXboxSession(session, env) {
  const key = await getXboxCookieKey(env);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const data = new TextEncoder().encode(JSON.stringify(session));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const payload = new Uint8Array(iv.length + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), iv.length);
  return encodeBase64Url(payload);
}

async function decryptXboxSession(value, env) {
  if (!value) return null;

  try {
    const payload = decodeBase64Url(value);
    const iv = payload.slice(0, 12);
    const encrypted = payload.slice(12);
    const key = await getXboxCookieKey(env);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    return null;
  }
}

function getXboxRedirectUri(request, env) {
  if (env.XBOX_REDIRECT_URI) return env.XBOX_REDIRECT_URI;
  const url = new URL(request.url);
  return `${url.origin}/api/xbox/auth/callback`;
}

async function postXboxJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.XErr || data?.error_description || data?.error || `Xbox HTTP ${response.status}`);
  }

  return data;
}

async function getXboxTokensFromMicrosoftAccessToken(accessToken) {
  const xbl = await postXboxJson("https://user.auth.xboxlive.com/user/authenticate", {
    Properties: {
      AuthMethod: "RPS",
      SiteName: "user.auth.xboxlive.com",
      RpsTicket: `d=${accessToken}`,
    },
    RelyingParty: "http://auth.xboxlive.com",
    TokenType: "JWT",
  });

  const xsts = await postXboxJson("https://xsts.auth.xboxlive.com/xsts/authorize", {
    Properties: {
      SandboxId: "RETAIL",
      UserTokens: [xbl.Token],
    },
    RelyingParty: "http://xboxlive.com",
    TokenType: "JWT",
  });

  const claim = xsts?.DisplayClaims?.xui?.[0] || {};

  return {
    uhs: claim.uhs || "",
    xuid: claim.xid || "",
    gamertag: claim.gtg || "",
    xstsToken: xsts.Token || "",
  };
}

async function refreshMicrosoftXboxToken(session, env) {
  if (!session?.refreshToken) {
    throw new Error("Reconnecte ton compte Xbox pour activer la synchronisation des titres.");
  }

  const response = await fetch("https://login.live.com/oauth20_token.srf", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.XBOX_CLIENT_ID,
      client_secret: env.XBOX_CLIENT_SECRET,
      refresh_token: session.refreshToken,
      grant_type: "refresh_token",
      scope: "XboxLive.signin XboxLive.offline_access",
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || "Session Xbox expiree. Reconnecte ton compte.");
  }

  return data;
}

function normalizeXboxTitle(title = {}) {
  const titleId =
    title.titleId ||
    title.id ||
    title.pfn ||
    title.scid ||
    "";
  const name =
    title.name ||
    title.titleName ||
    title.displayName ||
    title.title ||
    "";
  const achievement = title.achievement || title.achievements || {};
  const image =
    title.displayImage ||
    title.image ||
    title.titleImageUrl ||
    title.tileImage ||
    title?.images?.[0]?.url ||
    title?.assets?.[0]?.url ||
    "";

  return {
    xboxTitleId: String(titleId || name || "").trim(),
    name: String(name || "").trim(),
    image,
    xboxLastPlayedAt:
      title.lastTimePlayed ||
      title.lastPlayed ||
      title.lastUnlock ||
      title.lastUnlockTime ||
      "",
    xboxCurrentGamerscore: Number(achievement.currentGamerscore || title.currentGamerscore || 0),
    xboxMaxGamerscore: Number(achievement.totalGamerscore || achievement.maxGamerscore || title.maxGamerscore || 0),
    xboxCurrentAchievements: Number(achievement.currentAchievements || title.currentAchievements || 0),
    xboxTotalAchievements: Number(achievement.totalAchievements || title.totalAchievements || 0),
    platformNames: ["Xbox"],
  };
}

async function startXboxAuth(request, env) {
  if (!env.XBOX_CLIENT_ID || !env.XBOX_CLIENT_SECRET) {
    return privateJsonResponse(
      {
        error: "Configuration Xbox manquante. Ajoute XBOX_CLIENT_ID et XBOX_CLIENT_SECRET dans Cloudflare Pages.",
        setupRequired: true,
      },
      { status: 501 }
    );
  }

  const state = randomToken(32);
  const authUrl = new URL("https://login.live.com/oauth20_authorize.srf");
  authUrl.searchParams.set("client_id", env.XBOX_CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", getXboxRedirectUri(request, env));
  authUrl.searchParams.set("scope", "XboxLive.signin XboxLive.offline_access");
  authUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      location: authUrl.toString(),
      "set-cookie": buildCookie("checkpoint_xbox_state", state, request.url, { maxAge: 900 }),
      ...PRIVATE_JSON_HEADERS,
    },
  });
}

async function exchangeXboxCode(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const expectedState = getCookie(request, "checkpoint_xbox_state");
  const redirectHome = new URL("/", url.origin);

  if (!code || !state || !expectedState || state !== expectedState) {
    redirectHome.searchParams.set("xbox", "error");
    return new Response(null, {
      status: 302,
      headers: {
        location: redirectHome.toString(),
        "set-cookie": clearCookie("checkpoint_xbox_state", request.url),
      },
    });
  }

  try {
    const tokenResponse = await fetch("https://login.live.com/oauth20_token.srf", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.XBOX_CLIENT_ID,
        client_secret: env.XBOX_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: getXboxRedirectUri(request, env),
      }),
    });
    const tokenData = await tokenResponse.json().catch(() => ({}));

    if (!tokenResponse.ok) {
      throw new Error(tokenData?.error_description || tokenData?.error || "Connexion Microsoft refusee.");
    }

    const xboxTokens = await getXboxTokensFromMicrosoftAccessToken(tokenData.access_token);
    const uhs = xboxTokens.uhs;
    const xuid = xboxTokens.xuid;
    let profile = {
      xuid,
      gamertag: xboxTokens.gamertag || "Profil Xbox",
      avatar: "",
    };

    if (xuid && uhs && xboxTokens.xstsToken) {
      const profileUrl = `https://profile.xboxlive.com/users/xuid(${xuid})/profile/settings?settings=Gamertag,GameDisplayPicRaw`;
      const profileResponse = await fetch(profileUrl, {
        headers: {
          accept: "application/json",
          authorization: `XBL3.0 x=${uhs};${xboxTokens.xstsToken}`,
          "x-xbl-contract-version": "2",
        },
      });
      const profileData = await profileResponse.json().catch(() => ({}));
      const settings = profileData?.profileUsers?.[0]?.settings || [];
      const findSetting = (id) => settings.find((setting) => setting.id === id)?.value || "";
      profile = {
        xuid,
        gamertag: findSetting("Gamertag") || profile.gamertag,
        avatar: findSetting("GameDisplayPicRaw") || "",
      };
    }

    const session = {
      profile,
      refreshToken: tokenData.refresh_token || "",
      connectedAt: new Date().toISOString(),
      sessionVersion: 3,
    };
    const encryptedSession = await encryptXboxSession(session, env);

    redirectHome.searchParams.set("xbox", "connected");
    const headers = new Headers({ location: redirectHome.toString() });
    headers.append("set-cookie", clearCookie("checkpoint_xbox_state", request.url));
    headers.append(
      "set-cookie",
      buildCookie("checkpoint_xbox_session", encryptedSession, request.url, {
        maxAge: 60 * 60 * 24 * 30,
      })
    );

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    redirectHome.searchParams.set("xbox", "error");
    redirectHome.searchParams.set("message", String(error?.message || error).slice(0, 120));
    return new Response(null, {
      status: 302,
      headers: {
        location: redirectHome.toString(),
        "set-cookie": clearCookie("checkpoint_xbox_state", request.url),
      },
    });
  }
}

async function getXboxSession(request, env) {
  const session = await decryptXboxSession(getCookie(request, "checkpoint_xbox_session"), env);

  if (!session?.profile?.xuid) {
    return privateJsonResponse({
      connected: false,
      setupRequired: !env.XBOX_CLIENT_ID || !env.XBOX_CLIENT_SECRET || !env.XBOX_COOKIE_SECRET,
    });
  }

  return privateJsonResponse({
    connected: true,
    profile: session.profile,
    connectedAt: session.connectedAt || "",
    sessionVersion: session.sessionVersion || 1,
    capabilities: {
      profile: true,
      library: Boolean(session.refreshToken),
    },
    message:
      session.refreshToken
        ? "Compte Xbox connecte. Checkpoint peut maintenant tenter une synchronisation des titres Xbox detectes officiellement."
        : "Compte Xbox connecte. Reconnecte une fois pour activer la synchronisation des titres Xbox.",
  });
}

async function logoutXbox(request) {
  return privateJsonResponse(
    { connected: false },
    {
      headers: {
        "set-cookie": clearCookie("checkpoint_xbox_session", request.url),
      },
    }
  );
}

async function getXboxLibrary(request, env) {
  const session = await decryptXboxSession(getCookie(request, "checkpoint_xbox_session"), env);

  if (!session?.profile?.xuid) {
    return privateJsonResponse({ games: [], error: "Compte Xbox non connecte." }, { status: 401 });
  }

  if (!session.refreshToken) {
    return privateJsonResponse(
      {
        games: [],
        connected: true,
        reconnectRequired: true,
        profile: session.profile,
        error: "Reconnecte ton compte Xbox pour autoriser la synchronisation des titres.",
      },
      { status: 409 }
    );
  }

  const tokenData = await refreshMicrosoftXboxToken(session, env);
  const xboxTokens = await getXboxTokensFromMicrosoftAccessToken(tokenData.access_token);
  const xuid = session.profile.xuid || xboxTokens.xuid;
  const titleHistoryUrl = new URL(`https://achievements.xboxlive.com/users/xuid(${xuid})/history/titles`);
  titleHistoryUrl.searchParams.set("maxItems", "200");

  const response = await fetch(titleHistoryUrl.toString(), {
    headers: {
      accept: "application/json",
      authorization: `XBL3.0 x=${xboxTokens.uhs};${xboxTokens.xstsToken}`,
      "x-xbl-contract-version": "2",
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Xbox titles HTTP ${response.status}`);
  }

  const rawTitles = data.titles || data.titleHistory || data.items || [];
  const games = rawTitles
    .map(normalizeXboxTitle)
    .filter((game) => game.name && game.xboxTitleId)
    .sort((a, b) => String(b.xboxLastPlayedAt).localeCompare(String(a.xboxLastPlayedAt)));
  const nextSession = {
    ...session,
    refreshToken: tokenData.refresh_token || session.refreshToken,
    profile: {
      ...session.profile,
      xuid,
      gamertag: session.profile.gamertag || xboxTokens.gamertag,
    },
    sessionVersion: 3,
  };
  const encryptedSession = await encryptXboxSession(nextSession, env);

  return privateJsonResponse(
    {
      games,
      total: Number(data.pagingInfo?.totalItems || data.totalItems || games.length),
      connected: true,
      profile: nextSession.profile,
      libraryAvailable: true,
      source: "xbox-title-history",
      note:
        "Xbox ne fournit pas forcement toute la bibliotheque achetee. Cette synchronisation importe les titres officiellement detectes dans ton historique Xbox.",
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "set-cookie": buildCookie("checkpoint_xbox_session", encryptedSession, request.url, {
          maxAge: 60 * 60 * 24 * 30,
        }),
      },
    }
  );
}

function extractSteamProfileInput(value = "") {
  const input = String(value || "").trim();
  const decodedInput = decodeURIComponent(input);
  const profileMatch = decodedInput.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  const vanityMatch = decodedInput.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  const cleanVanity = (candidate = "") =>
    String(candidate)
      .trim()
      .replace(/^@/, "")
      .replace(/\/+$/, "");

  if (/^\d{17}$/.test(input)) {
    return { type: "steamid", value: input };
  }

  if (profileMatch?.[1]) {
    return { type: "steamid", value: profileMatch[1] };
  }

  if (vanityMatch?.[1]) {
    return { type: "vanity", value: cleanVanity(vanityMatch[1]) };
  }

  const vanityCandidate = cleanVanity(input);

  if (/^[a-zA-Z0-9_-]{2,64}$/.test(vanityCandidate)) {
    return { type: "vanity", value: vanityCandidate };
  }

  return { type: "invalid", value: input };
}

async function resolveSteamId(profileInput, env) {
  const parsed = extractSteamProfileInput(profileInput);

  if (parsed.type === "steamid") {
    return parsed.value;
  }

  if (parsed.type !== "vanity") {
    throw new Error("Profil Steam invalide. Utilise un SteamID64 ou une URL de profil Steam.");
  }

  const vanityUrl = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/");
  vanityUrl.searchParams.set("key", env.STEAM_API_KEY);
  vanityUrl.searchParams.set("vanityurl", parsed.value);
  vanityUrl.searchParams.set("format", "json");

  const data = await fetchJson(vanityUrl.toString(), 9000);
  const response = data?.response || {};

  if (String(response.success) !== "1" || !response.steamid) {
    throw new Error(
      "Impossible de trouver ce profil Steam. Utilise l'URL complete de ton profil ou ton SteamID64, pas seulement le pseudo affiche."
    );
  }

  return response.steamid;
}

function normalizeSteamLibraryGame(game) {
  const appId = Number(game?.appid);

  return {
    steamAppId: appId,
    name: game?.name || `Steam App ${appId}`,
    image: appId
      ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`
      : "",
    icon:
      appId && game?.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${game.img_icon_url}.jpg`
        : "",
    playtimeForever: Number(game?.playtime_forever || 0),
    playtimeWindowsForever: Number(game?.playtime_windows_forever || 0),
    playtimeMacForever: Number(game?.playtime_mac_forever || 0),
    playtimeLinuxForever: Number(game?.playtime_linux_forever || 0),
  };
}

function normalizeSteamWishlistGame(appId, game) {
  const numericAppId = Number(appId || game?.appid);
  const subs = Array.isArray(game?.subs) ? game.subs : [];
  const bestSub =
    subs.find((sub) => Number(sub.discount_pct || 0) > 0) ||
    subs.find((sub) => Number(sub.price || 0) > 0) ||
    subs[0] ||
    {};

  return {
    steamAppId: numericAppId,
    name: game?.name || `Steam App ${numericAppId}`,
    image:
      game?.capsule ||
      (numericAppId
        ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${numericAppId}/header.jpg`
        : ""),
    icon:
      game?.capsule ||
      (numericAppId
        ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${numericAppId}/capsule_184x69.jpg`
        : ""),
    playtimeForever: 0,
    status: "wishlist",
    source: "steam-wishlist",
    steamWishlistPriority: Number(game?.priority || 0),
    steamWishlistAddedAt: game?.added ? new Date(Number(game.added) * 1000).toISOString() : "",
    steamReleaseString: game?.release_string || "",
    steamReviewPercent: Number(game?.reviews_percent || 0),
    steamDiscountPercent: Number(bestSub.discount_pct || 0),
    steamPrice: Number(bestSub.price || 0),
  };
}

async function getSteamOwnedGames(requestUrl, env) {
  if (!env.STEAM_API_KEY) {
    return privateJsonResponse(
      {
        games: [],
        error: "STEAM_API_KEY manquante dans Cloudflare Pages.",
        setupRequired: true,
      },
      { status: 501 }
    );
  }

  const url = new URL(requestUrl);
  const profileInput =
    url.searchParams.get("profile") ||
    url.searchParams.get("steamid") ||
    "";
  const steamId = await resolveSteamId(profileInput, env);
  const ownedGamesUrl = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/");

  ownedGamesUrl.searchParams.set("key", env.STEAM_API_KEY);
  ownedGamesUrl.searchParams.set("steamid", steamId);
  ownedGamesUrl.searchParams.set("include_appinfo", "true");
  ownedGamesUrl.searchParams.set("include_played_free_games", "true");
  ownedGamesUrl.searchParams.set("format", "json");

  const data = await fetchJson(ownedGamesUrl.toString(), 14000);
  const response = data?.response || {};
  const games = (response.games || [])
    .map(normalizeSteamLibraryGame)
    .filter((game) => game.steamAppId && game.name)
    .sort((a, b) => b.playtimeForever - a.playtimeForever || a.name.localeCompare(b.name));

  return privateJsonResponse({
    steamId,
    total: Number(response.game_count || games.length),
    games,
    updatedAt: new Date().toISOString(),
  });
}

async function getSteamWishlist(requestUrl, env) {
  if (!env.STEAM_API_KEY) {
    return privateJsonResponse(
      {
        games: [],
        error: "STEAM_API_KEY manquante dans Cloudflare Pages.",
        setupRequired: true,
      },
      { status: 501 }
    );
  }

  const url = new URL(requestUrl);
  const profileInput =
    url.searchParams.get("profile") ||
    url.searchParams.get("steamid") ||
    "";
  const steamId = await resolveSteamId(profileInput, env);
  const wishlistUrl = `https://store.steampowered.com/wishlist/profiles/${encodeURIComponent(
    steamId
  )}/wishlistdata/?p=0`;
  const data = await fetchJson(wishlistUrl, 14000);

  if (!data || Array.isArray(data) || typeof data !== "object") {
    throw new Error(
      "Wishlist Steam indisponible. Verifie que ton profil et ta wishlist sont publics."
    );
  }

  const games = Object.entries(data)
    .map(([appId, game]) => normalizeSteamWishlistGame(appId, game))
    .filter((game) => game.steamAppId && game.name)
    .sort((a, b) => {
      const priorityDelta = a.steamWishlistPriority - b.steamWishlistPriority;
      if (priorityDelta) return priorityDelta;
      return a.name.localeCompare(b.name);
    });

  return privateJsonResponse({
    steamId,
    total: games.length,
    games,
    updatedAt: new Date().toISOString(),
  });
}

function formatStorePrice(value, currency = "EUR") {
  if (typeof value !== "number") return "";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value / 100);
}

function formatDealPrice(value, currency = "USD", usdRate = 1) {
  const price = Number.parseFloat(value);
  if (!Number.isFinite(price)) return "";
  if (price <= 0) return "Gratuit";
  const convertedPrice = currency === "USD" ? price : price * usdRate;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(convertedPrice);
}

function getEpicImage(images = []) {
  const preferred =
    images.find((image) => image.type === "OfferImageWide") ||
    images.find((image) => image.type === "featuredMedia") ||
    images.find((image) => image.type === "Thumbnail") ||
    images[0];

  return preferred?.url || "";
}

function getEpicDealUrl(item) {
  const mappingSlug = item.offerMappings?.[0]?.pageSlug;
  const productSlug = item.productSlug?.split("/")[0];
  const slug = productSlug || mappingSlug || item.urlSlug;

  return slug
    ? `https://store.epicgames.com/fr/p/${slug}`
    : "https://store.epicgames.com/fr/free-games";
}

function uniqueDealItems(items = [], getKey = (item) => item?.id) {
  const seen = new Set();

  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeSteamDeals(data) {
  const candidates = [
    ...(data?.specials?.items || []),
    ...(data?.top_sellers?.items || []),
    ...(data?.new_releases?.items || []),
    ...(data?.dailydeal?.items || []),
  ];

  return uniqueDealItems(candidates, (item) => item?.id)
    .filter((item) => item.discounted && item.discount_percent > 0)
    .sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
    .slice(0, DEAL_RESULT_LIMIT)
    .map((item) => ({
      id: `steam-${item.id}`,
      store: "steam",
      storeLabel: "Steam",
      title: item.name,
      image:
        item.large_capsule_image ||
        item.header_image ||
        item.small_capsule_image,
      discount: item.discount_percent,
      normalPrice: formatStorePrice(item.original_price, item.currency),
      salePrice: formatStorePrice(item.final_price, item.currency),
      url: `https://store.steampowered.com/app/${item.id}`,
      endsAt: item.discount_expiration
        ? new Date(item.discount_expiration * 1000).toISOString()
        : "",
    }));
}

async function getUsdCurrencyRate(currency = "USD") {
  if (currency === "USD") return 1;

  try {
    const data = await fetchJson(
      `https://api.frankfurter.app/latest?from=USD&to=${currency}`,
      5000
    );
    const rate = Number(data?.rates?.[currency]);
    return Number.isFinite(rate) && rate > 0 ? rate : 0.92;
  } catch (error) {
    return 0.92;
  }
}

function normalizeEpicDeals(data, currency = "USD", usdRate = 1) {
  if (Array.isArray(data)) {
    return data
      .filter((item) => item.isOnSale === "1" && Number.parseFloat(item.savings || "0") > 0)
      .sort((a, b) => Number.parseFloat(b.savings || "0") - Number.parseFloat(a.savings || "0"))
      .slice(0, DEAL_RESULT_LIMIT)
      .map((item) => ({
        id: `epic-${item.dealID || item.gameID}`,
        store: "epic",
        storeLabel: "Epic",
        title: item.title,
        image: item.thumb || "",
        discount: Math.round(Number.parseFloat(item.savings || "0")),
        normalPrice: formatDealPrice(item.normalPrice, currency, usdRate),
        salePrice: formatDealPrice(item.salePrice, currency, usdRate),
        url: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(item.dealID)}`,
        endsAt: "",
      }));
  }

  return (data?.data?.Catalog?.searchStore?.elements || [])
    .filter((item) => {
      const currentPromos = item.promotions?.promotionalOffers || [];
      const hasFreePromo = currentPromos.some((promoGroup) =>
        (promoGroup.promotionalOffers || []).some(
          (promo) => promo.discountSetting?.discountPercentage === 0
        )
      );
      const price = item.price?.totalPrice;

      return hasFreePromo || (price && price.discount > 0);
    })
    .slice(0, DEAL_RESULT_LIMIT)
    .map((item) => {
      const price = item.price?.totalPrice;
      const promo =
        item.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
      const isFree = promo?.discountSetting?.discountPercentage === 0;
      const originalPrice = price?.originalPrice || 1;

      return {
        id: `epic-${item.id}`,
        store: "epic",
        storeLabel: "Epic",
        title: item.title,
        image: getEpicImage(item.keyImages),
        discount: isFree
          ? 100
          : Math.round(((price?.discount || 0) / Math.max(originalPrice, 1)) * 100),
        normalPrice: price?.fmtPrice?.originalPrice || "",
        salePrice: isFree ? "Gratuit" : price?.fmtPrice?.discountPrice || "",
        url: getEpicDealUrl(item),
        endsAt: promo?.endDate || "",
      };
    });
}

function getDealRegion(requestUrl) {
  const url = new URL(requestUrl);
  const country = (url.searchParams.get("cc") || DEFAULT_DEAL_REGION.country)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2);
  const locale = (url.searchParams.get("locale") || DEFAULT_DEAL_REGION.locale)
    .replace(/[^a-zA-Z-]/g, "")
    .slice(0, 12);
  const steamLang = (url.searchParams.get("lang") || DEFAULT_DEAL_REGION.steamLang)
    .replace(/[^a-zA-Z-]/g, "")
    .slice(0, 24);
  const currency = (url.searchParams.get("currency") || (country === "US" ? "USD" : "EUR"))
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);

  return {
    country: country || DEFAULT_DEAL_REGION.country,
    locale: locale || DEFAULT_DEAL_REGION.locale,
    steamLang: steamLang || DEFAULT_DEAL_REGION.steamLang,
    currency: currency || DEFAULT_DEAL_REGION.currency,
  };
}

async function getDeals(requestUrl) {
  const region = getDealRegion(requestUrl);
  const usdRate = await getUsdCurrencyRate(region.currency);
  const sources = [
    {
      id: "steam",
      label: "Steam",
      url: `https://store.steampowered.com/api/featuredcategories?cc=${region.country}&l=${region.steamLang}`,
      normalize: normalizeSteamDeals,
    },
    {
      id: "epic",
      label: "Epic",
      url: "https://www.cheapshark.com/api/1.0/deals?storeID=25&onSale=1&pageSize=60&sortBy=Savings&desc=1",
      normalize: (data) => normalizeEpicDeals(data, region.currency, usdRate),
    },
  ];

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const data = await fetchJson(source.url);
      return {
        source,
        deals: source.normalize(data),
      };
    })
  );

  const deals = [];
  const status = {
    psn: "Lien officiel disponible.",
    xbox: "Lien officiel disponible.",
  };

  results.forEach((result, index) => {
    const source = sources[index];

    if (result.status === "fulfilled") {
      deals.push(...result.value.deals);
      status[source.id] =
        result.value.deals.length > 0 ? "OK" : "Aucune promo trouvee.";
    } else {
      status[source.id] = "Source indisponible pour le moment.";
    }
  });

  return {
    deals,
    status,
    region,
    updatedAt: new Date().toISOString(),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/deals") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      try {
        return jsonResponse(await getDeals(request.url));
      } catch (error) {
        return jsonResponse(
          {
            deals: [],
            status: {
              steam: "Source indisponible pour le moment.",
              epic: "Source indisponible pour le moment.",
              psn: "Lien officiel disponible.",
              xbox: "Lien officiel disponible.",
            },
            error: String(error?.message || error),
          },
          { status: 502 }
        );
      }
    }

    if (url.pathname === "/api/rawg/search" || url.pathname === "/api/rawg/games") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getRawgSearch(request, env);
    }

    if (url.pathname === "/api/igdb/games") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getIgdbGames(request, env);
    }

    if (url.pathname === "/api/igdb/upcoming") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getIgdbUpcoming(request, env);
    }

    if (url.pathname === "/api/rawg/upcoming") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getRawgUpcoming(request, env);
    }

    if (url.pathname === "/api/rawg/platforms") {
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getRawgProxy(request, env, "/platforms");
    }

    if (url.pathname === "/api/rawg/genres") {
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getRawgProxy(request, env, "/genres");
    }

    const rawgGameMatch = url.pathname.match(
      /^\/api\/rawg\/games\/([^/]+)(?:\/(screenshots|movies|additions))?$/
    );

    if (rawgGameMatch) {
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      const gameId = rawgGameMatch[1];
      const childPath = rawgGameMatch[2] ? `/${rawgGameMatch[2]}` : "";
      return getRawgProxy(request, env, `/games/${gameId}${childPath}`);
    }

    const igdbGameMatch = url.pathname.match(
      /^\/api\/igdb\/games\/([^/]+)(?:\/(screenshots|movies|additions))?$/
    );

    if (igdbGameMatch) {
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      const gameId = igdbGameMatch[1];
      const childPath = igdbGameMatch[2] ? `/${igdbGameMatch[2]}` : "";
      return getIgdbGameDetails(request, env, gameId, childPath);
    }

    if (url.pathname === "/api/steam/owned-games") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: PRIVATE_JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      try {
        return await getSteamOwnedGames(request.url, env);
      } catch (error) {
        return privateJsonResponse(
          {
            games: [],
            error: String(error?.message || error),
          },
          { status: 502 }
        );
      }
    }

    if (url.pathname === "/api/steam/wishlist") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: PRIVATE_JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      try {
        return await getSteamWishlist(request.url, env);
      } catch (error) {
        return privateJsonResponse(
          {
            games: [],
            error: String(error?.message || error),
          },
          { status: 502 }
        );
      }
    }

    if (url.pathname === "/api/xbox/auth/start") {
      if (request.method !== "GET") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return startXboxAuth(request, env);
    }

    if (url.pathname === "/api/xbox/auth/callback") {
      if (request.method !== "GET") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return exchangeXboxCode(request, env);
    }

    if (url.pathname === "/api/xbox/session") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: PRIVATE_JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return getXboxSession(request, env);
    }

    if (url.pathname === "/api/xbox/logout") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: PRIVATE_JSON_HEADERS });
      }

      if (request.method !== "POST") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      return logoutXbox(request);
    }

    if (url.pathname === "/api/xbox/library") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: PRIVATE_JSON_HEADERS });
      }

      if (request.method !== "GET") {
        return privateJsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      try {
        return await getXboxLibrary(request, env);
      } catch (error) {
        return privateJsonResponse(
          {
            games: [],
            connected: true,
            libraryAvailable: false,
            error: String(error?.message || error),
          },
          { status: 502 }
        );
      }
    }

    return assetResponse(request, env);
  },
};
