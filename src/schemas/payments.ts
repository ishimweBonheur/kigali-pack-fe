import { z } from "zod";

export const mockPaymentSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^(?:\+250|0)?7[2389]\d{7}$/,
      "Invalid Rwandan mobile number format",
    ),
  amount: z.number().positive("Amount must be positive"),
  webhookUrl: z.string().url("Enter a valid webhook URL"),
  clientReference: z.string().min(1, "Client reference is required"),
});

export const simulateWebhookSchema = z.object({
  eventType: z.string().optional(),
  transactionId: z.string().optional(),
  amount: z.number().optional(),
});

export type MockPaymentInput = z.infer<typeof mockPaymentSchema>;
export type SimulateWebhookInput = z.infer<typeof simulateWebhookSchema>;
