"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import db from "@repo/db/client";
import { P2PSchema } from "@repo/zod-schemas";

export async function p2pTransfer(toPhone: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = P2PSchema.safeParse({ toPhone, amount });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const fromUserId = Number(session.user.id);

  const toUser = await db.user.findUnique({ where: { number: toPhone } });
  if (!toUser) throw new Error("Recipient not found");
  if (toUser.id === fromUserId) throw new Error("Cannot send money to yourself");

  // Use a serializable transaction to prevent race conditions
  await db.$transaction(async (tx) => {
    // Lock sender's balance row
    const senderBalance = await tx.balance.findUnique({
      where: { userId: fromUserId }
    });

    if (!senderBalance || senderBalance.amount < amount) {
      throw new Error("Insufficient balance");
    }

    // Debit sender
    await tx.balance.update({
      where: { userId: fromUserId },
      data: { amount: { decrement: amount } }
    });

    // Credit recipient (upsert in case they have no balance row)
    await tx.balance.upsert({
      where: { userId: toUser.id },
      update: { amount: { increment: amount } },
      create: { userId: toUser.id, amount: amount, locked: 0 }
    });

    // Record the transfer
    await tx.p2pTransfer.create({
      data: {
        fromUserId,
        toUserId: toUser.id,
        amount,
        timestamp: new Date()
      }
    });
  });

  return { success: true };
}