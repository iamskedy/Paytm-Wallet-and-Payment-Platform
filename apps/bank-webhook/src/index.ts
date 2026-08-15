import "dotenv/config";
import express from "express";
import db from "@repo/db/client";
import { WebhookSchema } from "@repo/zod-schemas";
import crypto from "crypto";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();
app.use(express.json());
const swaggerDocument = YAML.load(
  path.join(process.cwd(), "packages/docs/swagger.bank-webhook.yaml")
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// HMAC signature verification middleware
function verifySignature(req: express.Request, res: express.Response, next: express.NextFunction) {
  const signature = req.headers["x-hdfc-signature"];
  const secret = process.env.HDFC_WEBHOOK_SECRET || "hdfc_secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ message: "Invalid signature" });
  }
  next();
}

// ── Onramp (Add Money) ─────────────────────────────────────────────
app.post("/hdfcWebhook", verifySignature, async (req, res) => {
  const result = WebhookSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload", errors: result.error.issues });
  }

  const { token, amount } = result.data;

  try {
    const transaction = await db.onRampTransaction.findUnique({ where: { token } });

    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }
    if (transaction.status === "Success") {
      return res.status(200).json({ message: "Already processed" });
    }
    if (transaction.status === "Failure") {
      return res.status(400).json({ message: "Transaction already failed" });
    }

    await db.$transaction([
      db.balance.upsert({
        where: { userId: transaction.userId },
        update: { amount: { increment: amount } },
        create: { userId: transaction.userId, amount: amount, locked: 0 }
      }),
      db.onRampTransaction.update({ where: { token }, data: { status: "Success" } })
    ]);

    return res.status(200).json({ message: "Payment processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    await db.onRampTransaction.update({ where: { token }, data: { status: "Failure" } }).catch(() => {});
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ── User Withdraw ───────────────────────────────────────────────────
app.post("/hdfcWithdrawWebhook", verifySignature, async (req, res) => {
  const result = WebhookSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload", errors: result.error.issues });
  }

  const { token, amount } = result.data;

  try {
    const txn = await db.payoutTransaction.findUnique({ where: { token } });

    if (!txn) {
      return res.status(400).json({ message: "Transaction not found" });
    }
    if (txn.status === "Success") {
      return res.status(200).json({ message: "Already processed" });
    }
    if (txn.status === "Failure") {
      return res.status(400).json({ message: "Transaction already failed" });
    }

    await db.$transaction([
      // Funds already left the wallet (moved to locked at initiation) — just release the lock.
      db.balance.update({
        where: { userId: txn.userId },
        data: { locked: { decrement: amount } }
      }),
      db.payoutTransaction.update({ where: { token }, data: { status: "Success" } })
    ]);

    return res.status(200).json({ message: "Withdrawal processed successfully" });
  } catch (error) {
    console.error("Withdraw webhook processing error:", error);
    try {
      await db.$transaction([
        // Payout failed — return the locked funds to spendable balance.
        db.balance.update({
          where: { userId: (await db.payoutTransaction.findUnique({ where: { token } }))!.userId },
          data: { amount: { increment: amount }, locked: { decrement: amount } }
        }),
        db.payoutTransaction.update({ where: { token }, data: { status: "Failure" } })
      ]);
    } catch {}
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ── Merchant Withdraw ────────────────────────────────────────────────
app.post("/hdfcMerchantWithdrawWebhook", verifySignature, async (req, res) => {
  const result = WebhookSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload", errors: result.error.issues });
  }

  const { token, amount } = result.data;

  try {
    const txn = await db.merchantPayoutTransaction.findUnique({ where: { token } });

    if (!txn) {
      return res.status(400).json({ message: "Transaction not found" });
    }
    if (txn.status === "Success") {
      return res.status(200).json({ message: "Already processed" });
    }
    if (txn.status === "Failure") {
      return res.status(400).json({ message: "Transaction already failed" });
    }

    await db.$transaction([
      db.merchantBalance.update({
        where: { merchantId: txn.merchantId },
        data: { locked: { decrement: amount } }
      }),
      db.merchantPayoutTransaction.update({ where: { token }, data: { status: "Success" } })
    ]);

    return res.status(200).json({ message: "Withdrawal processed successfully" });
  } catch (error) {
    console.error("Merchant withdraw webhook processing error:", error);
    try {
      await db.$transaction([
        db.merchantBalance.update({
          where: {
            merchantId: (await db.merchantPayoutTransaction.findUnique({ where: { token } }))!.merchantId
          },
          data: { amount: { increment: amount }, locked: { decrement: amount } }
        }),
        db.merchantPayoutTransaction.update({ where: { token }, data: { status: "Failure" } })
      ]);
    } catch {}
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Bank webhook listening on port ${PORT}`);
});