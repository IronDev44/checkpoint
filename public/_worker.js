const STEAM_DEALS_URL =
  "https://store.steampowered.com/api/featuredcategories?cc=FR&l=french";
const EPIC_DEALS_URL =
  "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=fr-FR&country=FR&allowCountries=FR";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=300, s-maxage=900",
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

async function fetchJson(url, timeout = 9000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent": "Checkpoint/1.0",
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

function formatStorePrice(value, currency = "EUR") {
  if (typeof value !== "number") return "";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value / 100);
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

function normalizeSteamDeals(data) {
  return (data?.specials?.items || [])
    .filter((item) => item.discounted && item.discount_percent > 0)
    .slice(0, 24)
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

function normalizeEpicDeals(data) {
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
    .slice(0, 24)
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

async function getDeals() {
  const sources = [
    {
      id: "steam",
      label: "Steam",
      url: STEAM_DEALS_URL,
      normalize: normalizeSteamDeals,
    },
    {
      id: "epic",
      label: "Epic",
      url: EPIC_DEALS_URL,
      normalize: normalizeEpicDeals,
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
    psn: "PSN demande une source serveur dediee avant synchro automatique.",
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
        return jsonResponse(await getDeals());
      } catch (error) {
        return jsonResponse(
          {
            deals: [],
            status: {
              steam: "Source indisponible pour le moment.",
              epic: "Source indisponible pour le moment.",
              psn: "PSN demande une source serveur dediee avant synchro automatique.",
            },
            error: String(error?.message || error),
          },
          { status: 502 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
