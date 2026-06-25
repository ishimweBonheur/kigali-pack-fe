import api from "./api";
import type {
  ApiSuccessResponse,
  SandboxTransaction,
  PaginationMeta,
} from "@/types";
import { normalizeListItems } from "@/utils/list";
import type {
  MockPaymentInput,
  SimulateWebhookInput,
} from "@/schemas/payments";

export interface SandboxHistoryQuery {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export const paymentsService = {
  async charge(input: MockPaymentInput) {
    const { data } = await api.post<
      ApiSuccessResponse<{
        transactionId: string;
        simulatedGateway: string;
        simulatedStatus: string;
        checkStatusEndpoint: string;
      }>
    >("/v1/sandbox/payments/charge", input);
    return data.data;
  },

  async simulateWebhook(input: SimulateWebhookInput) {
    const { data } = await api.post<ApiSuccessResponse<Record<string, unknown>>>(
      "/v1/sandbox/payments/webhook/simulate",
      input,
    );
    return data.data;
  },

  async getTestAccounts() {
    const { data } = await api.get<
      ApiSuccessResponse<{
        accounts: Array<{ phone: string; carrier: string }>;
        rules: Record<string, string>;
        statuses: string[];
      }>
    >("/v1/sandbox/payments/test-accounts");
    return data.data;
  },

  async listHistory(query?: SandboxHistoryQuery) {
    const { data } = await api.get<
      ApiSuccessResponse<SandboxTransaction[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >("/v1/sandbox/payments/history", { params: query });
    return {
      items: normalizeListItems(data.data),
      pagination: data.meta?.pagination,
    };
  },

  async getTransaction(id: string): Promise<SandboxTransaction> {
    const { data } = await api.get<ApiSuccessResponse<SandboxTransaction>>(
      `/v1/sandbox/payments/history/${id}`,
    );
    return data.data;
  },

  async getStatus(transactionId: string): Promise<SandboxTransaction> {
    const { data } = await api.get<ApiSuccessResponse<SandboxTransaction>>(
      `/v1/sandbox/payments/status/${transactionId}`,
    );
    return data.data;
  },
};
