const DEFAULT_API_BASE_URL = "https://checkpoint-eka.pages.dev";

export function getApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_CHECKPOINT_API_BASE_URL || DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
