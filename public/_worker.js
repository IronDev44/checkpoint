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

    return assetResponse(request, env);
  },
};
