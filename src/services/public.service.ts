import axios from "axios";
import { getApiBaseUrl } from "@/constants";
import type { ApiSuccessResponse, BillingPlan } from "@/types";

export const publicApi = axios.create({
  headers: { "Content-Type": "application/json" },
});

publicApi.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

export interface Province {
  id: string;
  name: string;
  level: string;
  code: string | null;
}

export interface BoilerplateScaffold {
  templateName: string;
  architectureStyle: string;
  recommendedDependencies: Record<string, string[]>;
  envBoilerplateLayout: string[];
}

export interface VersionInfo {
  version: string;
  apiVersion: string;
  environment: string;
  nodeVersion: string;
}

export interface ProbeResult {
  status: number;
  data: unknown;
  durationMs: number;
}

export const publicService = {
  async getRootProvinces(): Promise<Province[]> {
    const { data } = await publicApi.get<ApiSuccessResponse<Province[]>>(
      "/v1/locations/root-provinces",
    );
    return data.data;
  },

  async getPlans(): Promise<BillingPlan[]> {
    const { data } = await publicApi.get<ApiSuccessResponse<BillingPlan[]>>(
      "/v1/billing/plans",
    );
    return data.data;
  },

  async getBoilerplate(): Promise<BoilerplateScaffold> {
    const { data } = await publicApi.get<BoilerplateScaffold>(
      "/v1/compliance/boilerplates/scaffold",
    );
    return data;
  },

  async getVersion(): Promise<VersionInfo> {
    const { data } = await publicApi.get<VersionInfo>("/version");
    return data;
  },

  async probeEndpoint(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    token?: string,
    body?: unknown,
  ): Promise<ProbeResult> {
    const start = performance.now();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await publicApi.request({
        method,
        url: path,
        headers,
        data: body,
      });
      return {
        status: response.status,
        data: response.data,
        durationMs: Math.round(performance.now() - start),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
          durationMs: Math.round(performance.now() - start),
        };
      }
      throw error;
    }
  },
};
