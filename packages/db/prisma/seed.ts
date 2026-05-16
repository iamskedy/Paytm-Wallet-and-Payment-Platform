// packages/db/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users (upsert = safe to re-run) ───────────────────────
  const alice = await prisma.user.upsert({
    where: { number: "1111111111" },
    update: {},
    create: {
      number: "1111111111",
      password: await bcrypt.hash("alice", 10),
      name: "Alice",
      email: "alice@example.com",
    },
  });

  const bob = await prisma.user.upsert({
    where: { number: "2222222222" },
    update: {},
    create: {
      number: "2222222222",
      password: await bcrypt.hash("bob", 10),
      name: "Bob",
      email: "bob@example.com",
    },
  });

  // ── Balances (separate upsert — safer than nesting) ────────
  await prisma.balance.upsert({
    where: { userId: alice.id },
    update: {},
    create: {
      userId: alice.id,
      amount: 100000,   // ₹1000 in paise
      locked: 0,
    },
  });

  await prisma.balance.upsert({
    where: { userId: bob.id },
    update: {},
    create: {
      userId: bob.id,
      amount: 50000,    // ₹500 in paise
      locked: 0,
    },
  });

  // ── OnRamp Transactions ─────────────────────────────────────
  const onRamp1 = await prisma.onRampTransaction.upsert({
    where: { token: "seed-token-alice-001" },
    update: {},
    create: {
      userId: alice.id,
      amount: 100000,
      status: "Success",
      token: "seed-token-alice-001",
      provider: "HDFC",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  const onRamp2 = await prisma.onRampTransaction.upsert({
    where: { token: "seed-token-bob-001" },
    update: {},
    create: {
      userId: bob.id,
      amount: 50000,
      status: "Success",
      token: "seed-token-bob-001",
      provider: "HDFC",
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // ── P2P Transfers (analytics chart data) ───────────────────
  const transfers = [
    { amount: 5000,  daysAgo: 6,  desc: "Lunch split"    },
    { amount: 15000, daysAgo: 5,  desc: "Rent share"     },
    { amount: 3000,  daysAgo: 4,  desc: "Coffee"         },
    { amount: 20000, daysAgo: 3,  desc: "Movie tickets"  },
    { amount: 8000,  daysAgo: 1,  desc: "Groceries"      },
  ];

  for (const t of transfers) {
    await prisma.p2pTransfer.create({
      data: {
        fromUserId: alice.id,
        toUserId: bob.id,
        amount: t.amount,
        timestamp: new Date(Date.now() - t.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Alice created  — balance: ₹1000");
  console.log("✅ Bob created    — balance: ₹500");
  console.log("✅ OnRamp txns    — 2 successful top-ups");
  console.log("✅ P2P transfers  — 5 seeded (analytics ready)");
  console.log(`\n🔑 Login credentials:`);
  console.log(`   Alice → number: 1111111111 / password: alice`);
  console.log(`   Bob   → number: 2222222222 / password: bob`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());