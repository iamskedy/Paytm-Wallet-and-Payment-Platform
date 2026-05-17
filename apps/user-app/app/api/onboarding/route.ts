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

  // Check if phone already taken
  const existing = await db.user.findFirst({ where: { number: phone } });
  if (existing) {
    return NextResponse.json({ message: "Phone number already in use." }, { status: 409 });
  }

  await db.user.update({
  where: { email: session.user.email },
  data: { number: phone },
});

  return NextResponse.json({ success: true });
}