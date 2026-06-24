import api from "./api";
import type {
  ApiSuccessResponse,
  BillingPlan,
  Subscription,
  Invoice,
  UsageCounter,
  PaginationMeta,
  PaginationParams,
} from "@/types";

export const billingService = {
  async listPlans(): Promise<BillingPlan[]> {
    const { data } = await api.get<ApiSuccessResponse<BillingPlan[]>>(
      "/v1/billing/plans",
    );
    return data.data;
  },

  async getCurrentSubscription(): Promise<Subscription | null> {
    const { data } = await api.get<ApiSuccessResponse<Subscription | null>>(
      "/v1/billing/subscriptions/current",
    );
    return data.data;
  },

  async subscribe(planCode: string): Promise<Subscription> {
    const { data } = await api.post<ApiSuccessResponse<Subscription>>(
      "/v1/billing/subscriptions",
      { planCode },
    );
    return data.data;
  },

  async cancel(): Promise<Subscription> {
    const { data } = await api.delete<ApiSuccessResponse<Subscription>>(
      "/v1/billing/subscriptions/current",
    );
    return data.data;
  },

  async listInvoices(params?: PaginationParams) {
    const { data } = await api.get<
      ApiSuccessResponse<Invoice[]> & { meta?: { pagination?: PaginationMeta } }
    >("/v1/billing/invoices", { params });
    return { items: data.data, pagination: data.meta?.pagination };
  },

  async getInvoice(id: string): Promise<Invoice> {
    const { data } = await api.get<ApiSuccessResponse<Invoice>>(
      `/v1/billing/invoices/${id}`,
    );
    return data.data;
  },

  async getUsageCounter(): Promise<UsageCounter> {
    const { data } = await api.get<ApiSuccessResponse<UsageCounter>>(
      "/v1/billing/usage-counter",
    );
    return data.data;
  },
};
