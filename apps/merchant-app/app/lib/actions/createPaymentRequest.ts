"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";

export async function createPaymentRequest(amount: number, description: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Not authenticated");

  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
  if (!description || !description.trim()) throw new Error("Description is required");

  const merchant = await db.merchant.findUniqueOrThrow({
    where: { email: session.user.email }
  });

  const request = await db.paymentRequest.create({
    data: {
      merchantId: merchant.id,
      amount,
      description
    }
  });

  return { id: request.id };
}