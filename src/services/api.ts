import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl, AUTH_ROUTES } from "@/constants";
import type { ApiSuccessResponse, AuthTokens } from "@/types";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let redirectingToLogin = false;
let sessionStatus: "loading" | "authenticated" | "unauthenticated" = "loading";
let authReadyWaiters: Array<() => void> = [];

const PUBLIC_API_PATHS = [
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/auth/forgot-password",
  "/v1/auth/reset-password",
  "/v1/auth/verify-email",
  "/v1/billing/plans",
] as const;

export function setAuthTokens(tokens: AuthTokens | null) {
  if (tokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  } else {
    accessToken = null;
    refreshToken = null;
  }
}

export function setSessionStatus(status: typeof sessionStatus) {
  sessionStatus = status;
  if (status === "authenticated" && accessToken) {
    for (const resolve of authReadyWaiters) resolve();
    authReadyWaiters = [];
  }
}

export function getAccessToken() {
  return accessToken;
}

function isPublicApi(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_API_PATHS.some((path) => url.includes(path));
}

function waitForAuthReady(timeoutMs = 10_000): Promise<void> {
  if (sessionStatus === "authenticated" && accessToken) {
    return Promise.resolve();
  }
  if (sessionStatus === "unauthenticated") {
    return Promise.reject(new Error("Unauthenticated"));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      authReadyWaiters = authReadyWaiters.filter((fn) => fn !== onReady);
      reject(new Error("Auth ready timeout"));
    }, timeoutMs);

    const onReady = () => {
      clearTimeout(timer);
      authReadyWaiters = authReadyWaiters.filter((fn) => fn !== onReady);
      resolve();
    };

    authReadyWaiters.push(onReady);
  });
}

function redirectToLogin() {
  if (typeof window === "undefined" || redirectingToLogin) return;

  const path = window.location.pathname;
  if (
    path.startsWith(AUTH_ROUTES.login) ||
    path.startsWith(AUTH_ROUTES.getStarted) ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password")
  ) {
    return;
  }

  redirectingToLogin = true;
  const callback = encodeURIComponent(path);
  window.location.assign(`${AUTH_ROUTES.login}?callbackUrl=${callback}`);
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<ApiSuccessResponse<{
        tokens: AuthTokens;
        memberId: string;
        organizationId: string;
        role: string;
        email: string;
      }>>(`${getApiBaseUrl()}/v1/auth/refresh`, { refreshToken });

      const tokens = data.data.tokens;
      setAuthTokens(tokens);
      return tokens.accessToken;
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      // Rate-limited or server error — keep existing tokens, do not clear
      if (status === 429 || (status !== undefined && status >= 500)) {
        return accessToken;
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();

  const needsAuth =
    typeof window !== "undefined" &&
    !isPublicApi(config.url) &&
    !config.url?.includes("/v1/auth/refresh");

  if (needsAuth && !accessToken) {
    if (sessionStatus === "loading") {
      try {
        await waitForAuthReady();
      } catch {
        return Promise.reject(
          new axios.CanceledError("Request cancelled: auth not ready"),
        );
      }
    }
  }

  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _skipAuthRedirect?: boolean;
    };

    const status = error.response?.status;

    if (status === 429) {
      return Promise.reject(error);
    }

    if (status === 401) {
      const url = originalRequest?.url ?? "";
      const isAuthRoute = url.includes("/v1/auth/");

      if (sessionStatus === "loading") {
        return Promise.reject(error);
      }

      if (
        originalRequest &&
        !originalRequest._retry &&
        refreshToken &&
        !isAuthRoute
      ) {
        originalRequest._retry = true;
        const newToken = await refreshAccessToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

      if (
        !originalRequest?._skipAuthRedirect &&
        !isAuthRoute &&
        sessionStatus === "unauthenticated" &&
        !accessToken &&
        !refreshToken
      ) {
        redirectToLogin();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
