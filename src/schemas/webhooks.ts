import { z } from "zod";

export const createWebhookSchema = z.object({
  url: z.string().url("Enter a valid URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
  description: z.string().max(255).optional(),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  description: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
