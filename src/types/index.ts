export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  period?: { from: string; to: string };
  summary?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  memberId: string;
  organizationId: string;
  role: string;
  email: string;
  tokens: AuthTokens;
}

export interface Profile {
  id: string;
  email: string;
  emailVerified: boolean;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

export type ApiKeyEnvironment = "LIVE" | "TEST" | "SANDBOX";
export type ApiKeyTier = "FREE" | "PRO" | "ENTERPRISE";

export interface ApiKey {
  id: string;
  name: string | null;
  keyPrefix: string;
  environment: ApiKeyEnvironment;
  tier: ApiKeyTier;
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse extends ApiKey {
  rawToken: string;
}

export interface RotateApiKeyResponse extends CreateApiKeyResponse {
  newKeyId: string;
  revokedKeyId: string;
}

export interface AnalyticsSummary {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  averageLatencyMs: number;
  uniqueEndpoints: number;
  recentErrorLogs: number;
}

export interface AnalyticsSummaryResponse {
  period: { from: string; to: string };
  summary: AnalyticsSummary;
  topEndpoints: Array<{ endpoint: string; requests: number }>;
}

export interface UsageRecord {
  id: string;
  endpoint: string;
  requests: number;
  errorCount: number;
  averageLatencyMs: number;
  usageDate: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  eventType: string;
  status: string;
  attemptCount: number;
  responseStatus: number | null;
  createdAt: string;
  deliveredAt: string | null;
}

export interface BillingPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceMonthlyRwf: number;
  rateLimitPerHour: number | null;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  plan: BillingPlan;
}

export interface Invoice {
  id: string;
  amountRwf: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface UsageCounter {
  used: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
  percentUsed: number;
}

export interface SandboxTransaction {
  id: string;
  phoneNumber: string;
  amount: number;
  gateway: string;
  status: string;
  failureReason: string | null;
  webhookUrl: string;
  clientReference: string;
  completedAt: string | null;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  createdAt?: string;
}
