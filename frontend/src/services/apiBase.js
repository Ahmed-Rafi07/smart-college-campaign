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

const RETRYABLE_STATUS_CODES = new Set([408, 429, 502, 503, 504]);
const RETRYABLE_METHODS = new Set(["GET", "HEAD"]);
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

let fetchInterceptorInstalled = false;

const rewriteLegacyUrl = (url) => {
  for (const legacyBaseUrl of LEGACY_BASE_URLS) {
    if (url.startsWith(`${legacyBaseUrl}/`)) {
      return `${API_BASE_URL}${url.slice(legacyBaseUrl.length)}`;
    }
  }

  return url;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRequestMethod = (input, init) => {
  const method = init?.method || (input instanceof Request ? input.method : "GET");
  return (method || "GET").toUpperCase();
};

const isRetryableMethod = (method) => RETRYABLE_METHODS.has(method);

const fetchWithRetry = async (executeFetch, attemptsLeft) => {
  try {
    const response = await executeFetch();

    if (!RETRYABLE_STATUS_CODES.has(response.status) || attemptsLeft <= 0) {
      return response;
    }

    await wait(RETRY_DELAY_MS);
    return fetchWithRetry(executeFetch, attemptsLeft - 1);
  } catch (error) {
    if (attemptsLeft <= 0) {
      throw error;
    }

    await wait(RETRY_DELAY_MS);
    return fetchWithRetry(executeFetch, attemptsLeft - 1);
  }
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
    const method = getRequestMethod(input, init);

    const executeFetch = () => {
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

    if (!isRetryableMethod(method)) {
      return executeFetch();
    }

    return fetchWithRetry(executeFetch, MAX_RETRY_ATTEMPTS);
  };

  fetchInterceptorInstalled = true;
};
