const RAWG_API_BASE = "https://api.rawg.io/api";
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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRawgMessage(status) {
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

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": statusCode === 200 ? "public, max-age=300" : "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getRawgPath(event) {
  const pathFromQuery = event.queryStringParameters?.path;
  if (pathFromQuery) {
    return pathFromQuery.startsWith("/") ? pathFromQuery : `/${pathFromQuery}`;
  }

  const suffix = event.path.split("/.netlify/functions/rawg")[1] || "";
  return suffix.startsWith("/") ? suffix : `/${suffix || "games"}`;
}

async function fetchRawg(url, { timeout = 12000, retries = 2 } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: "application/json",
          "user-agent": "Checkpoint/1.0 (Netlify RAWG proxy)",
        },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(getRawgMessage(response.status));
        error.status = response.status;
        error.retryable = RAWG_RETRY_STATUSES.has(response.status);
        throw error;
      }

      return payload;
    } catch (error) {
      lastError = error?.name === "AbortError" ? new Error("RAWG n'a pas repondu assez vite.") : error;
      lastError.status = lastError.status || 0;
      lastError.retryable = Boolean(lastError.retryable);

      if (!(attempt < retries && lastError.retryable)) {
        throw lastError;
      }

      await wait(450 * (attempt + 1));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const key = process.env.RAWG_API_KEY || process.env.RAWG_KEY;
  if (!key) {
    return json(500, {
      sourceStatus: "unavailable",
      code: "RAWG_KEY_MISSING",
      message: "RAWG_API_KEY manque dans les variables d'environnement Netlify.",
    });
  }

  const rawgUrl = new URL(`${RAWG_API_BASE}${getRawgPath(event)}`);
  rawgUrl.searchParams.set("key", key);

  Object.entries(event.queryStringParameters || {}).forEach(([param, value]) => {
    if (param !== "path" && RAWG_PUBLIC_PARAMS.has(param) && value) {
      rawgUrl.searchParams.set(param, value);
    }
  });

  try {
    const data = await fetchRawg(rawgUrl.toString());
    return json(200, {
      ...data,
      sourceStatus: "ok",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return json(error.status === 429 ? 429 : 503, {
      sourceStatus: "unavailable",
      upstreamStatus: error.status || null,
      message: error.message || "RAWG est temporairement indisponible.",
      updatedAt: new Date().toISOString(),
    });
  }
};
