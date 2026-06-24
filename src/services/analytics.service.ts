import api from "./api";
import type {
  ApiSuccessResponse,
  AnalyticsSummaryResponse,
  UsageRecord,
  ApiLog,
  PaginationMeta,
} from "@/types";

export interface AnalyticsQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export const analyticsService = {
  async getSummary(query?: AnalyticsQuery): Promise<AnalyticsSummaryResponse> {
    const { data } = await api.get<ApiSuccessResponse<AnalyticsSummaryResponse>>(
      "/v1/developer/analytics/summary",
      { params: query },
    );
    return data.data;
  },

  async getUsage(query?: AnalyticsQuery) {
    const { data } = await api.get<
      ApiSuccessResponse<UsageRecord[]> & { meta?: { pagination?: PaginationMeta } }
    >("/v1/developer/analytics/usage", { params: query });
    return { items: data.data, pagination: data.meta?.pagination };
  },

  async getErrors(query?: AnalyticsQuery) {
    const { data } = await api.get<ApiSuccessResponse<Record<string, unknown>>>(
      "/v1/developer/analytics/errors",
      { params: query },
    );
    return data.data;
  },

  async getLatency(query?: AnalyticsQuery) {
    const { data } = await api.get<ApiSuccessResponse<Record<string, unknown>>>(
      "/v1/developer/analytics/latency",
      { params: query },
    );
    return data.data;
  },

  async getLogs(query?: AnalyticsQuery & { statusCode?: number }) {
    const { data } = await api.get<
      ApiSuccessResponse<ApiLog[]> & { meta?: { pagination?: PaginationMeta } }
    >("/v1/developer/analytics/logs", { params: query });
    return { items: data.data, pagination: data.meta?.pagination };
  },
};
