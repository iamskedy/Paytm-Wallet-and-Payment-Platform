import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";
import { PayConfirmClient } from "./PayConfirmClient";

export default async function PayPage({
  searchParams
}: {
  searchParams: { to?: string; requestId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=/pay?to=${searchParams.to}&requestId=${searchParams.requestId}`);

  const { requestId, to } = searchParams;

  if (!requestId) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 28 }}>
        <div className="pf-card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Invalid Payment Link</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>No payment request was specified.</div>
        </div>
      </div>
    );
  }

  const request = await db.paymentRequest.findUnique({
    where: { id: requestId },
    include: { merchant: true }
  });

  if (!request) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 28 }}>
        <div className="pf-card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Invalid Payment Link</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>This payment request doesn&apos;t exist.</div>
        </div>
      </div>
    );
  }

  // Defense in depth: the merchantId in the URL should match the request's
  // actual merchant. requestId alone is authoritative for amount/description.
  if (to && Number(to) !== request.merchantId) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 28 }}>
        <div className="pf-card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Invalid Payment Link</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>This link appears to be corrupted.</div>
        </div>
      </div>
    );
  }

  if (request.status !== "pending") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 28 }}>
        <div className="pf-card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Link No Longer Active</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>
            {request.status === "paid" ? "This payment has already been completed." : "This payment link has expired."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pf-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px" }}>
          Confirm Payment
        </div>
      </div>

      <div style={{ padding: 28, maxWidth: 480 }}>
        <div className="pf-card" style={{ padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Paying
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            {request.merchant.name ?? request.merchant.email}
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
            {request.description}
          </div>

          <div style={{
            background: "rgba(37,99,235,.08)", border: "1px solid rgba(37,99,235,.2)",
            borderRadius: 14, padding: "18px 20px", marginBottom: 24
          }}>
            <div style={{ fontSize: 11, color: "#60A5FA", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
              Amount
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 500, letterSpacing: "-1px" }}>
              ₹{(request.amount / 100).toFixed(2)}
            </div>
          </div>

          <PayConfirmClient requestId={request.id} />
        </div>
      </div>
    </div>
  );
}