/** Direct backend URL — used by the server-side proxy only */
export const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3000";

/**
 * Client-side requests go through the Next.js proxy to avoid CORS
 * (frontend :3001 → /api/proxy → backend :3000).
 * Server-side code may call the backend directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return BACKEND_URL;
}

/** @deprecated use getApiBaseUrl() — kept for backwards compat */
export const API_BASE_URL = BACKEND_URL;

/** Public-facing API URL shown in docs & code snippets */
export const API_PUBLIC_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

export const AUTH_ROUTES = {
  login: "/login",
  getStarted: "/get-started",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

export const DASHBOARD_ROUTES = {
  overview: "/dashboard",
  apiKeys: "/dashboard/api-keys",
  playground: "/dashboard/playground",
  analytics: "/dashboard/analytics",
  payments: "/dashboard/payments",
  webhooks: "/dashboard/webhooks",
  billing: "/dashboard/billing",
  organizations: "/dashboard/organizations",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
} as const;

/** Primary sidebar navigation (7 icon-only items). */
export const SIDEBAR_NAV_ITEMS = [
  { label: "Overview", href: DASHBOARD_ROUTES.overview, icon: "ti-layout-dashboard" },
  { label: "API Keys", href: DASHBOARD_ROUTES.apiKeys, icon: "ti-key" },
  { label: "Playground", href: DASHBOARD_ROUTES.playground, icon: "ti-terminal-2" },
  { label: "Analytics", href: DASHBOARD_ROUTES.analytics, icon: "ti-chart-bar" },
  { label: "Payments", href: DASHBOARD_ROUTES.payments, icon: "ti-credit-card" },
  { label: "Webhooks", href: DASHBOARD_ROUTES.webhooks, icon: "ti-webhook" },
  { label: "Billing", href: DASHBOARD_ROUTES.billing, icon: "ti-receipt" },
] as const;

export const NAV_ITEMS = [
  { label: "Overview", href: DASHBOARD_ROUTES.overview, icon: "LayoutDashboard" },
  { label: "API Keys", href: DASHBOARD_ROUTES.apiKeys, icon: "Key" },
  { label: "Playground", href: DASHBOARD_ROUTES.playground, icon: "Terminal" },
  { label: "Analytics", href: DASHBOARD_ROUTES.analytics, icon: "BarChart3" },
  { label: "Payments", href: DASHBOARD_ROUTES.payments, icon: "CreditCard" },
  { label: "Webhooks", href: DASHBOARD_ROUTES.webhooks, icon: "Webhook" },
  { label: "Billing", href: DASHBOARD_ROUTES.billing, icon: "Receipt" },
  { label: "Organizations", href: DASHBOARD_ROUTES.organizations, icon: "Building2" },
  { label: "Profile", href: DASHBOARD_ROUTES.profile, icon: "User" },
  { label: "Settings", href: DASHBOARD_ROUTES.settings, icon: "Settings" },
] as const;

export const WEBHOOK_EVENTS = [
  "payment.success",
  "payment.failed",
  "payment.pending",
  "subscription.created",
  "subscription.cancelled",
] as const;

export const API_KEY_ENVIRONMENTS = ["LIVE", "TEST", "SANDBOX"] as const;

export const DEFAULT_PAGE_SIZE = 10;

export const ONBOARDING_STORAGE_KEY = "kp-onboarding-v1";
