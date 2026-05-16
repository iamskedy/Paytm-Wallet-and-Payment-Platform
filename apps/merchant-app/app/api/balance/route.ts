import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const merchant = await db.merchant.findUnique({
    where: { email: session.user.email },
    include: { balance: true }
  });

  return NextResponse.json({
    amount: merchant?.balance?.amount ?? 0
  });
};