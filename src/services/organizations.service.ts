import api from "./api";
import type {
  ApiSuccessResponse,
  Organization,
  OrganizationMember,
  PaginationMeta,
  PaginationParams,
} from "@/types";

export const organizationsService = {
  async list(): Promise<Organization[]> {
    const { data } = await api.get<ApiSuccessResponse<Organization[]>>(
      "/v1/organizations",
    );
    return data.data;
  },

  async listMembers(orgId: string, params?: PaginationParams) {
    const { data } = await api.get<
      ApiSuccessResponse<OrganizationMember[]> & {
        meta?: { pagination?: PaginationMeta };
      }
    >(`/v1/organizations/${orgId}/members`, { params });
    return { items: data.data, pagination: data.meta?.pagination };
  },

  async addMember(
    orgId: string,
    input: { email: string; role: string },
  ): Promise<OrganizationMember> {
    const { data } = await api.post<ApiSuccessResponse<OrganizationMember>>(
      `/v1/organizations/${orgId}/members`,
      input,
    );
    return data.data;
  },

  async removeMember(orgId: string, memberId: string): Promise<void> {
    await api.delete(`/v1/organizations/${orgId}/members/${memberId}`);
  },
};
