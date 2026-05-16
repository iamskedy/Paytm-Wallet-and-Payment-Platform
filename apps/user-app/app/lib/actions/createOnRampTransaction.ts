"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import db from "@repo/db/client";
import { OnRampSchema } from "@repo/zod-schemas";
import { v4 as uuidv4 } from "uuid";

export async function createOnRampTransaction(amount: number, provider: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = OnRampSchema.safeParse({ amount, provider });
  if (!parsed.success) throw new Error("Invalid input");

  const token = uuidv4();

  await db.onRampTransaction.create({
    data: {
      userId: Number(session.user.id),
      amount: parsed.data.amount,
      provider: parsed.data.provider,
      status: "Processing",
      startTime: new Date(),
      token
    }
  });

  // In production: redirect to bank's payment page with token as query param
  // For development: directly call the webhook with this token
  return { token };
}