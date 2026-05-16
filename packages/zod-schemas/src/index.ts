import { z } from "zod";

export const OnRampSchema = z.object({
  amount: z.number().positive().max(10000000), // max 1 lakh rupees in paise
  provider: z.enum(["HDFC", "SBI", "AXIS"])
});

export const P2PSchema = z.object({
  toPhone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  amount: z.number().positive().max(10000000)
});

export const WebhookSchema = z.object({
  token: z.string(),
  user_identifier: z.string(),
  amount: z.number().positive()
});