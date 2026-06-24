import api from "./api";
import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type {
  AdminDeveloper,
  AdminOverviewMetrics,
  AdminSubscription,
  AdminTelemetryLog,
  AdminWebhookFailure,
  InvoiceStatusInput,
  TierOverrideInput,
} from "@/types/admin";

export interface AdminQuery {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  status?: string;
  statusCode?: number;
}

export const adminService = {
  async getOverview(): Promise<AdminOverviewMetrics> {
    const { data } = await api.get<ApiSuccessResponse<AdminOverviewMetrics>>(
      "/v1/admin/overview",
    );
    return data.data;
  },

  async listSubscriptions(query?: AdminQuery) {
    const { data } = await api.get<
      ApiSuccessResponse<AdminSubscription[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >("/v1/admin/billing/subscriptions", { params: query });
    return {
      items: data.data,
      pagination: data.meta?.pagination,
    };
  },

  async overrideSubscriptionTier(id: string, input: TierOverrideInput) {
    const { data } = await api.put<
      ApiSuccessResponse<{
        id: string;
        developerName: string;
        status: string;
        planCode: string;
        rateLimitPerHour: number | null;
        message: string;
      }>
    >(`/v1/admin/billing/subscriptions/${id}/tier-override`, input);
    return data.data;
  },

  async updateInvoiceStatus(id: string, input: InvoiceStatusInput) {
    const { data } = await api.patch<
      ApiSuccessResponse<{
        id: string;
        status: string;
        paidAt: string | null;
        message: string;
      }>
    >(`/v1/admin/billing/invoices/${id}/status`, input);
    return data.data;
  },

  async listDevelopers(query?: AdminQuery) {
    const { data } = await api.get<
      ApiSuccessResponse<AdminDeveloper[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >("/v1/admin/developers", { params: query });
    return {
      items: data.data,
      pagination: data.meta?.pagination,
    };
  },

  async restrictDeveloper(id: string, reason?: string) {
    const { data } = await api.post<
      ApiSuccessResponse<{
        memberId: string;
        email: string;
        organizationSlug: string;
        reason: string;
        message: string;
      }>
    >(`/v1/admin/developers/${id}/restrict`, { reason });
    return data.data;
  },

  async getTelemetryStream(query?: AdminQuery) {
    const { data } = await api.get<
      ApiSuccessResponse<AdminTelemetryLog[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >("/v1/admin/telemetry/live-stream", { params: query });
    return {
      items: data.data,
      pagination: data.meta?.pagination,
    };
  },

  async listWebhookFailures(query?: AdminQuery) {
    const { data } = await api.get<
      ApiSuccessResponse<AdminWebhookFailure[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >("/v1/admin/webhooks/failures", { params: query });
    return {
      items: data.data,
      pagination: data.meta?.pagination,
    };
  },
};
