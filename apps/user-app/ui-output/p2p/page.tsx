"use client";
import { useState } from "react";
import { p2pTransfer } from "../lib/actions/p2pTransfer";

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function P2PPage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (phone.length !== 10) { setStatus("error"); setMessage("Enter a valid 10-digit phone number."); return; }
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { setStatus("error"); setMessage("Enter a valid amount."); return; }
    setStatus("loading");
    setMessage("");
    try {
      const amountPaise = Math.round(parsed * 100);
      await p2pTransfer(phone, amountPaise);
      setStatus("success");
      setMessage(`₹${parsed.toFixed(2)} sent to +91 ${phone} successfully!`);
      setPhone("");
      setAmount("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Transfer failed.");
    }
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <div>
      {/* Topbar */}
      <div className="pf-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px" }}>
          Send Money
        </div>
      </div>

      <div style={{ padding: 28, maxWidth: 560 }}>

        {/* Recipient */}
        <div className="pf-card" style={{ padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
            Recipient
          </div>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text3)"
            }}>+91</span>
            <input
              className="pf-input-plain"
              type="tel"
              placeholder="10-digit phone number"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              style={{ paddingLeft: 52 }}
            />
          </div>
          {phone.length === 10 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#34D399" }}>●</span> PayFlow user lookup enabled
              </span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="pf-card" style={{ padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
            Amount
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, color: "var(--text3)" }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 500,
                color: "var(--text)", letterSpacing: "-1px"
              }}
            />
          </div>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Quick select</div>
          <div style={{ display: "flex", gap: 8 }}>
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  background: amount === String(a) ? "rgba(5,150,105,.2)" : "var(--surface)",
                  border: amount === String(a) ? "1px solid rgba(5,150,105,.35)" : "1px solid var(--border2)",
                  color: amount === String(a) ? "#34D399" : "var(--text2)",
                  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
                  transition: "all .15s"
                }}
              >
                ₹{a}
              </button>
            ))}
          </div>
        </div>

        {/* Summary & CTA */}
        <div className="pf-card" style={{ padding: "22px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Sending to</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              {phone.length === 10 ? `+91 ${phone}` : "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Amount</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: amountNum > 0 ? "#34D399" : "var(--text2)" }}>
              {amountNum > 0 ? `₹${amountNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
            </span>
          </div>

          {message && (
            <div style={{
              marginBottom: 16, padding: "10px 14px",
              background: status === "success" ? "rgba(5,150,105,.08)" : "rgba(220,38,38,.08)",
              border: `1px solid ${status === "success" ? "rgba(5,150,105,.2)" : "rgba(220,38,38,.2)"}`,
              borderRadius: 8, fontSize: 12,
              color: status === "success" ? "#34D399" : "#F87171"
            }}>
              {message}
            </div>
          )}

          <button
            className="pf-btn pf-btn-green"
            onClick={handleSend}
            disabled={status === "loading" || !phone || !amount}
          >
            {status === "loading" ? "Sending…" : "Send Money Securely"}
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontSize: 11, color: "var(--text3)" }}>HMAC-secured · Atomic transaction</span>
          </div>
        </div>

      </div>
    </div>
  );
}
