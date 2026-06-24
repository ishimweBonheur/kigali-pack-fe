import api from "./api";
import type {
  ApiSuccessResponse,
  Webhook,
  WebhookDelivery,
  PaginationMeta,
  PaginationParams,
} from "@/types";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
} from "@/schemas/webhooks";

export const webhooksService = {
  async list(params?: PaginationParams) {
    const { data } = await api.get<
      ApiSuccessResponse<Webhook[]> & { meta?: { pagination?: PaginationMeta } }
    >("/v1/developer/webhooks", { params });
    return { items: data.data, pagination: data.meta?.pagination };
  },

  async create(input: CreateWebhookInput): Promise<Webhook> {
    const { data } = await api.post<ApiSuccessResponse<Webhook>>(
      "/v1/developer/webhooks",
      input,
    );
    return data.data;
  },

  async update(id: string, input: UpdateWebhookInput): Promise<Webhook> {
    const { data } = await api.patch<ApiSuccessResponse<Webhook>>(
      `/v1/developer/webhooks/${id}`,
      input,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/v1/developer/webhooks/${id}`);
  },

  async test(id: string): Promise<void> {
    await api.post(`/v1/developer/webhooks/${id}/test`);
  },

  async listDeliveries(id: string, params?: PaginationParams) {
    const { data } = await api.get<
      ApiSuccessResponse<WebhookDelivery[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >(`/v1/developer/webhooks/${id}/deliveries`, { params });
    return { items: data.data, pagination: data.meta?.pagination };
  },

  async retryDelivery(deliveryId: string): Promise<void> {
    await api.post(`/v1/developer/webhooks/deliveries/${deliveryId}/retry`);
  },
};
