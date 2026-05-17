import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await req.json();

  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ message: "Invalid phone number" }, { status: 400 });
  }

  await db.merchant.update({
    where: { email: session.user.email },
    data: { number: phone },
  });

  return NextResponse.json({ success: true });
}