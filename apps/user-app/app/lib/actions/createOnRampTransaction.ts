"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import db from "@repo/db/client";
import { OnRampSchema } from "@repo/zod-schemas";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function createOnRampTransaction(amount: number, provider: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = OnRampSchema.safeParse({ amount, provider });
  if (!parsed.success) throw new Error("Invalid input");

  const userId = Number(session.user.id);
  const token = uuidv4();

  await db.onRampTransaction.create({
    data: {
      userId,
      amount: parsed.data.amount,
      provider: parsed.data.provider,
      status: "Processing",
      startTime: new Date(),
      token
    }
  });

  // In production: redirect to bank's payment page with token as query param,
  // and the bank calls our webhook once the user pays.
  // DEV-ONLY: there's no real bank locally, so we simulate that callback
  // immediately by calling the bank-webhook service ourselves.
  const payload = {
    token,
    user_identifier: session.user.email ?? String(userId), // session.user.email holds the phone number in this app
    amount: parsed.data.amount
  };
  const body = JSON.stringify(payload);

  const secret = process.env.HDFC_WEBHOOK_SECRET || "hdfc_secret";
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  console.log("[user-app] secret len:", secret.length, "body:", body);

  const webhookUrl = process.env.BANK_WEBHOOK_URL || "http://localhost:3003";

  try {
    const res = await fetch(`${webhookUrl}/hdfcWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hdfc-signature": signature
      },
      body
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Webhook responded ${res.status}`);
    }
  } catch (err: any) {
    // Transaction row stays "Processing" — safe to retry/poll, but surface
    // the failure so it's not silently stuck.
    throw new Error(
      `Payment initiated but bank confirmation failed: ${err.message}. Is bank-webhook running on port 3003?`
    );
  }

  return { token };
}