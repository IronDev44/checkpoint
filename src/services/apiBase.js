const DEFAULT_NATIVE_API_ORIGIN = "https://checkpoint-eka.pages.dev";

function trimTrailingSlash(value = "") {
  return String(value).replace(/\/+$/, "");
}

function isNativeCapacitorRuntime() {
  if (typeof window === "undefined") return false;

  return (
    window.location?.protocol === "capacitor:" ||
    window.Capacitor?.isNativePlatform?.() === true
  );
}

export function getApiBaseUrl() {
  const configuredUrl = trimTrailingSlash(process.env.REACT_APP_API_BASE_URL || "");
  if (configuredUrl) return configuredUrl;

  return isNativeCapacitorRuntime() ? DEFAULT_NATIVE_API_ORIGIN : "";
}

export function apiUrl(path = "") {
  const normalizedPath = String(path).startsWith("/") ? String(path) : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
