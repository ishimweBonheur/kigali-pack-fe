import type { PaginationMeta } from "@/types";

export const ADMIN_ROLES = [
  "MASTER_ADMIN",
  "ADMIN",
  "OWNER",
  "ORG_OWNER",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | undefined): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export interface AdminOverviewMetrics {
  totalOrganizations: number;
  totalActiveApiKeys: number;
  totalMrrRwf: number;
  globalAverageLatencyMs: number;
  globalErrorRate: number;
}

export interface AdminSubscription {
  id: string;
  developerName: string;
  status: string;
  plan: {
    code: string;
    name: string;
    priceMonthlyRwf: number;
    rateLimitPerHour: number | null;
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface AdminDeveloper {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  apiKeyCount: number;
  activeApiKeys: number;
  totalRequests: number;
  createdAt: string;
}

export interface AdminTelemetryLog {
  id: string;
  developerId: string;
  routePath: string;
  httpMethod: string;
  httpStatusCode: number;
  executionTimeMs: number;
  processingMode: string;
  maskedRequestSnapshot: string;
  maskedResponseSnapshot: string;
  timestamp: string;
}

export interface AdminWebhookFailure {
  id: string;
  eventType: string;
  status: string;
  attemptCount: number;
  errorMessage: string | null;
  responseStatus: number | null;
  webhookUrl: string;
  developerName: string | null;
  lastAttemptAt: string | null;
  createdAt: string;
}

export interface PaginatedAdminResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface TierOverrideInput {
  planCode?: string;
  rateLimitPerHour?: number;
  status?: string;
}

export interface InvoiceStatusInput {
  status: "DRAFT" | "OPEN" | "PAID" | "VOID";
}
