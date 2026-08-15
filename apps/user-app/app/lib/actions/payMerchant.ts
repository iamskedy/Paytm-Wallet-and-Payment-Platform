"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import db from "@repo/db/client";

export async function payMerchant(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const fromUserId = Number(session.user.id);

  await db.$transaction(async (tx) => {
    // Extended where-unique update: only flips pending -> paid, and throws
    // (Prisma P2025) if the link was already used — this is the double-spend guard.
    let request;
    try {
      request = await tx.paymentRequest.update({
        where: { id: requestId, status: "pending" },
        data: { status: "paid" }
      });
    } catch (err) {
      throw new Error("Payment link already used or invalid");
    }

    const senderBalance = await tx.balance.findUnique({
      where: { userId: fromUserId }
    });

    if (!senderBalance || senderBalance.amount < request.amount) {
      throw new Error("Insufficient balance");
    }

    await tx.balance.update({
      where: { userId: fromUserId },
      data: { amount: { decrement: request.amount } }
    });

    await tx.merchantBalance.upsert({
      where: { merchantId: request.merchantId },
      update: { amount: { increment: request.amount } },
      create: { merchantId: request.merchantId, amount: request.amount, locked: 0 }
    });

    await tx.merchantTransaction.create({
      data: {
        merchantId: request.merchantId,
        fromUserId,
        amount: request.amount,
        status: "completed"
      }
    });
  });

  return { success: true };
}