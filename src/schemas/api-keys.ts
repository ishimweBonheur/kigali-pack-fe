import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().max(100).optional(),
  environment: z.enum(["LIVE", "TEST", "SANDBOX"]),
  expiresAt: z.string().optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
