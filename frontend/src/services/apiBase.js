const DEFAULT_API_BASE_URL = "https://smart-college-campaign.onrender.com";

const normalizeBaseUrl = (url) => (url || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const buildApiUrl = (path = "") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const LEGACY_BASE_URLS = [
  "http://localhost:5000",
  "https://smart-college-campaign.onrender.com",
];

let fetchInterceptorInstalled = false;

const rewriteLegacyUrl = (url) => {
  for (const legacyBaseUrl of LEGACY_BASE_URLS) {
    if (url.startsWith(`${legacyBaseUrl}/`)) {
      return `${API_BASE_URL}${url.slice(legacyBaseUrl.length)}`;
    }
  }

  return url;
};

export const installApiFetchInterceptor = () => {
  if (fetchInterceptorInstalled || typeof window === "undefined") {
    return;
  }

  if (typeof window.fetch !== "function") {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return originalFetch(rewriteLegacyUrl(input), init);
    }

    if (input instanceof Request) {
      const rewrittenUrl = rewriteLegacyUrl(input.url);

      if (rewrittenUrl !== input.url) {
        const rewrittenRequest = new Request(rewrittenUrl, input);
        return originalFetch(rewrittenRequest, init);
      }
    }

    return originalFetch(input, init);
  };

  fetchInterceptorInstalled = true;
};
