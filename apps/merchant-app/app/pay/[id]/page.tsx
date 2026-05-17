"use client";
import { useSearchParams } from "next/navigation";

export default function PayPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const description = searchParams.get("description");

  const handlePayNow = () => {
    window.location.href = `http://localhost:3001/pay?to=${params.id}&amount=${amount}&description=${encodeURIComponent(description || "")}`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-body)",
      padding: "0 16px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,.14) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none"
      }} />

      <div className="m-card" style={{
        width: "100%", maxWidth: 400,
        padding: "36px 32px",
        position: "relative", overflow: "hidden",
        textAlign: "center"
      }}>
        {/* Top shine */}
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 1,
          background: "linear-gradient(90deg, transparent, #10B981, transparent)"
        }} />

        {/* Merchant badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 99, marginBottom: 20,
          background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)",
          fontSize: 11, color: "#10B981", fontFamily: "var(--font-mono)"
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#10B981", display: "inline-block"
          }} />
          Secure Payment Request
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".07em" }}>
            Amount Due
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 48, fontWeight: 500, letterSpacing: "-2px", color: "var(--text)" }}>
            ₹{amount ? parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div style={{
            fontSize: 14, color: "var(--text2)", marginBottom: 28,
            padding: "10px 16px", borderRadius: 8,
            background: "rgba(255,255,255,.03)", border: "1px solid var(--border)"
          }}>
            {description}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayNow}
          className="m-btn"
          style={{ marginBottom: 16 }}
        >
          Pay Now — ₹{amount ? parseFloat(amount).toLocaleString("en-IN") : "0"}
        </button>

        {/* Security footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>
            Secured by PayFlow · HMAC verified
          </span>
        </div>

        {/* Payment ID */}
        <div style={{ marginTop: 16, fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
          Payment ID: {params.id}
        </div>
      </div>
    </div>
  );
}
