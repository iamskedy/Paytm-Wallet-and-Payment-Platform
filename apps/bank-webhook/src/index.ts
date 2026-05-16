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
  path.join(
    process.cwd(),
    "packages/docs/swagger.bank-webhook.yaml"
  )
);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

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

app.post("/hdfcWebhook", verifySignature, async (req, res) => {
  // 1. Validate payload shape
  const result = WebhookSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload", errors: result.error.issues });
  }

  const { token, user_identifier, amount } = result.data;

  try {
    // 2. Find the pending transaction (idempotency check)
    const transaction = await db.onRampTransaction.findUnique({
      where: { token }
    });

    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }

    if (transaction.status === "Success") {
      // Already processed — idempotent response
      return res.status(200).json({ message: "Already processed" });
    }

    if (transaction.status === "Failure") {
      return res.status(400).json({ message: "Transaction already failed" });
    }

    // 3. Atomic DB transaction — update both tables or neither
    await db.$transaction([
      db.balance.upsert({
        where: { userId: transaction.userId },
        update: { amount: { increment: amount } },
        create: { userId: transaction.userId, amount: amount, locked: 0 }
      }),
      db.onRampTransaction.update({
        where: { token },
        data: { status: "Success" }
      })
    ]);

    return res.status(200).json({ message: "Payment processed successfully" });

  } catch (error) {
    console.error("Webhook processing error:", error);
    // Mark transaction as failed
    await db.onRampTransaction.update({
      where: { token },
      data: { status: "Failure" }
    }).catch(() => {});
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(3003, () => {
  console.log("Bank webhook listening on port 3003");
});