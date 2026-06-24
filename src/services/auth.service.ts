import api from "./api";
import type {
  ApiSuccessResponse,
  AuthUser,
  AuthTokens,
  Profile,
} from "@/types";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/schemas/auth";

export const authService = {
  async login(input: LoginInput): Promise<AuthUser> {
    const { data } = await api.post<ApiSuccessResponse<AuthUser>>(
      "/v1/auth/login",
      input,
    );
    return data.data;
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    const { data } = await api.post<ApiSuccessResponse<AuthUser>>(
      "/v1/auth/register",
      input,
    );
    return data.data;
  },

  async refresh(refreshToken: string): Promise<AuthUser> {
    const { data } = await api.post<ApiSuccessResponse<AuthUser>>(
      "/v1/auth/refresh",
      { refreshToken },
    );
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/v1/auth/logout", { refreshToken });
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<string> {
    const { data } = await api.post<ApiSuccessResponse<{ message: string }>>(
      "/v1/auth/forgot-password",
      input,
    );
    return data.message;
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await api.post("/v1/auth/reset-password", input);
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post("/v1/auth/verify-email", { token });
  },
};

export const profileService = {
  async getProfile(): Promise<Profile> {
    const { data } = await api.get<ApiSuccessResponse<Profile>>("/v1/me");
    return data.data;
  },

  async updateProfile(
    input: Partial<{ email: string; password: string }>,
  ): Promise<Profile> {
    const { data } = await api.patch<ApiSuccessResponse<Profile>>(
      "/v1/me",
      input,
    );
    return data.data;
  },

  async deleteProfile(): Promise<void> {
    await api.delete("/v1/me");
  },
};

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  emailVerified?: Date | null;
};

export function authUserToSession(user: AuthUser): SessionUser {
  return {
    id: user.memberId,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    accessToken: user.tokens.accessToken,
    refreshToken: user.tokens.refreshToken,
    expiresAt: Date.now() + user.tokens.expiresIn * 1000,
  };
}

export function sessionToTokens(session: SessionUser): AuthTokens {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
  };
}
