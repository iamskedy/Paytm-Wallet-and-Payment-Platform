"use client";
import { useState } from "react";
import { payMerchant } from "../lib/actions/payMerchant";

export function PayConfirmClient({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handlePay = async () => {
    setStatus("loading");
    try {
      await payMerchant(requestId);
      setStatus("success");
      setMessage("Payment successful!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Payment failed");
    }
  };

  if (status === "success") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "13px", borderRadius: 10,
        background: "rgba(5,150,105,.1)", border: "1px solid rgba(5,150,105,.25)",
        color: "#34D399", fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {message}
      </div>
    );
  }

  return (
    <div>
      <button className="pf-btn" onClick={handlePay} disabled={status === "loading"}>
        {status === "loading" ? "Processing…" : "Confirm & Pay"}
      </button>
      {status === "error" && (
        <div style={{
          marginTop: 14, padding: "10px 14px",
          background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)",
          borderRadius: 8, fontSize: 12, color: "#F87171"
        }}>
          {message}
        </div>
      )}
    </div>
  );
}