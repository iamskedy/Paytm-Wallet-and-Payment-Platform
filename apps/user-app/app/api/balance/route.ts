import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../lib/auth";
import db from "@repo/db/client";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const balance = await db.balance.findUnique({
    where: { userId: Number(session.user.id) }
  });

  return NextResponse.json({
    amount: balance?.amount ?? 0,
    locked: balance?.locked ?? 0
  });
};