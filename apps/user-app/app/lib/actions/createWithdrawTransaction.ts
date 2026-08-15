"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import db from "@repo/db/client";
import { WithdrawSchema } from "@repo/zod-schemas";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function createWithdrawTransaction(amount: number, provider: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = WithdrawSchema.safeParse({ amount, provider });
  if (!parsed.success) throw new Error("Invalid input");

  const userId = Number(session.user.id);
  const token = uuidv4();

  await db.$transaction(async (tx) => {
    const balance = await tx.balance.findUnique({ where: { userId } });
    if (!balance || balance.amount < parsed.data.amount) {
      throw new Error("Insufficient balance");
    }

    // Move funds from spendable -> locked while the payout is in flight
    await tx.balance.update({
      where: { userId },
      data: { amount: { decrement: parsed.data.amount }, locked: { increment: parsed.data.amount } }
    });

    await tx.payoutTransaction.create({
      data: {
        userId,
        amount: parsed.data.amount,
        provider: parsed.data.provider,
        status: "Processing",
        startTime: new Date(),
        token
      }
    });
  });

  // DEV-ONLY: simulate the bank confirming the payout, same pattern as onramp.
  const payload = {
    token,
    user_identifier: session.user.email ?? String(userId),
    amount: parsed.data.amount
  };
  const body = JSON.stringify(payload);

  const secret = process.env.HDFC_WEBHOOK_SECRET || "hdfc_secret";
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const webhookUrl = process.env.BANK_WEBHOOK_URL || "http://localhost:3003";

  try {
    const res = await fetch(`${webhookUrl}/hdfcWithdrawWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hdfc-signature": signature },
      body
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Webhook responded ${res.status}`);
    }
  } catch (err: any) {
    throw new Error(
      `Withdrawal initiated but bank confirmation failed: ${err.message}. Is bank-webhook running on port 3003?`
    );
  }

  return { token };
}