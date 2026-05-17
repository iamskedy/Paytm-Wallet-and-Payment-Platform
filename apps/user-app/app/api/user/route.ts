import { NextResponse } from "next/server";
import db from "@repo/db/client";
import bcrypt from "bcrypt";

export const GET = async () => {
  return NextResponse.json({ message: "hi there" });
};

export const POST = async (req: Request) => {
  const { name, number, password } = await req.json();

  if (!number || !password) {
    return NextResponse.json({ message: "Phone and password required" }, { status: 400 });
  }

  const existing = await db.user.findFirst({ where: { number } });
  if (existing) {
    return NextResponse.json({ message: "Phone number already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name: name ?? "",
      number,
      password: hashed,
      auth_type: "Credentials",
    },
  });

  return NextResponse.json({ success: true });
};