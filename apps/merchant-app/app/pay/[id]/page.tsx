import db from "@repo/db/client";

export default async function PayPage({ params }: { params: { id: string } }) {
  const request = await db.paymentRequest.findUnique({
    where: { id: params.id }
  });

  if (!request) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="m-card" style={{ padding: "40px 32px", maxWidth: 380, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Payment Link Not Found</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>This link is invalid.</div>
        </div>
      </div>
    );
  }

  if (request.status !== "pending") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="m-card" style={{ padding: "40px 32px", maxWidth: 380, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Link No Longer Active</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>
            {request.status === "paid" ? "This payment has already been completed." : "This payment link has expired."}
          </div>
        </div>
      </div>
    );
  }

  const userAppPayUrl = `http://localhost:3001/pay?to=${request.merchantId}&requestId=${request.id}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="m-card" style={{ padding: "36px 32px", maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Payment Request</div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>{request.description}</div>

        <div style={{
          background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)",
          borderRadius: 14, padding: "18px 20px", marginBottom: 24
        }}>
          <div style={{ fontSize: 11, color: "#6EE7B7", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
            Amount
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 500, letterSpacing: "-1px" }}>
            ₹{(request.amount / 100).toFixed(2)}
          </div>
        </div>

        <a
          href={userAppPayUrl}
          style={{
            display: "block", width: "100%", padding: 13, borderRadius: 10,
            fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600,
            color: "#fff", background: "linear-gradient(135deg, #059669, #10B981)",
            boxShadow: "0 4px 20px rgba(16,185,129,.3)", textDecoration: "none",
            letterSpacing: "-.2px"
          }}
        >
          Pay Now
        </a>

        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 16, fontFamily: "var(--font-mono)" }}>
          Payment ID: {request.id}
        </div>
      </div>
    </div>
  );
}