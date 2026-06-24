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

export function setAuthTokens(tokens: AuthTokens | null) {
  if (tokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  } else {
    accessToken = null;
    refreshToken = null;
  }
}

export function getAccessToken() {
  return accessToken;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const callback = encodeURIComponent(window.location.pathname);
  window.location.href = `${AUTH_ROUTES.login}?callbackUrl=${callback}`;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;

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
  } catch {
    setAuthTokens(null);
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _skipAuthRedirect?: boolean;
    };

    if (error.response?.status === 401) {
      const url = originalRequest?.url ?? "";
      const isAuthRoute = url.includes("/v1/auth/");

      if (
        originalRequest &&
        !originalRequest._retry &&
        refreshToken &&
        !isAuthRoute
      ) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

      if (!originalRequest?._skipAuthRedirect && !isAuthRoute) {
        redirectToLogin();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
