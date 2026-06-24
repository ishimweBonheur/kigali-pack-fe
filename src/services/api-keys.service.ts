import api from "./api";
import type {
  ApiSuccessResponse,
  ApiKey,
  CreateApiKeyResponse,
  RotateApiKeyResponse,
  PaginationParams,
  PaginationMeta,
} from "@/types";
import type { CreateApiKeyInput } from "@/schemas/api-keys";

export const apiKeysService = {
  async list(params?: PaginationParams & { search?: string }) {
    const { data } = await api.get<
      ApiSuccessResponse<ApiKey[]> & { meta?: { pagination?: PaginationMeta } }
    >("/v1/developer/api-keys", { params });

    return {
      items: data.data,
      pagination: data.meta?.pagination,
    };
  },

  async create(input: CreateApiKeyInput): Promise<CreateApiKeyResponse> {
    const { data } = await api.post<ApiSuccessResponse<CreateApiKeyResponse>>(
      "/v1/developer/api-keys",
      input,
    );
    return data.data;
  },

  async revoke(id: string): Promise<ApiKey> {
    const { data } = await api.patch<ApiSuccessResponse<ApiKey>>(
      `/v1/developer/api-keys/${id}/revoke`,
    );
    return data.data;
  },

  async rotate(id: string): Promise<RotateApiKeyResponse> {
    const { data } = await api.post<ApiSuccessResponse<RotateApiKeyResponse>>(
      `/v1/developer/api-keys/${id}/rotate`,
    );
    return data.data;
  },
};
