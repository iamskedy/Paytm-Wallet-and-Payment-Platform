"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWithdrawTransaction } from "../lib/actions/createWithdrawTransaction";

const PROVIDERS = [
  { id: "HDFC", label: "HDFC Bank", icon: "🏦" },
  { id: "SBI", label: "State Bank of India", icon: "🏛️" },
  { id: "AXIS", label: "Axis Bank", icon: "🔵" },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("HDFC");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { setResult({ type: "error", message: "Please enter a valid amount." }); return; }
    setLoading(true);
    setResult(null);
    try {
      const amountPaise = Math.round(parsed * 100);
      await createWithdrawTransaction(amountPaise, provider);
      setResult({ type: "success", message: `₹${parsed.toFixed(2)} withdrawal to ${provider} successful!` });
      setAmount("");
      router.refresh();
    } catch (err: any) {
      setResult({ type: "error", message: err.message ?? "Something went wrong." });
    }
    setLoading(false);
  };

  const selectedBank = PROVIDERS.find(p => p.id === provider);

  return (
    <div>
      {/* Topbar */}
      <div className="pf-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px" }}>
          Withdraw Money
        </div>
      </div>

      <div style={{ padding: 28, maxWidth: 560 }}>

        {/* Amount card */}
        <div className="pf-card" style={{ padding: "28px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
            Enter Amount
          </div>

          {/* Big amount input */}
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

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

          {/* Quick amounts */}
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Quick select</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                style={{
                  padding: "7px 16px", borderRadius: 8,
                  background: amount === String(a) ? "rgba(217,119,6,.18)" : "var(--surface)",
                  border: amount === String(a) ? "1px solid rgba(217,119,6,.4)" : "1px solid var(--border2)",
                  color: amount === String(a) ? "#FBBF24" : "var(--text2)",
                  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
                  transition: "all .15s"
                }}
              >
                ₹{a.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        {/* Bank selector */}
        <div className="pf-card" style={{ padding: "22px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
            Withdraw To
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PROVIDERS.map(p => (
              <div
                key={p.id}
                onClick={() => setProvider(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                  background: provider === p.id ? "rgba(217,119,6,.1)" : "var(--surface)",
                  border: provider === p.id ? "1px solid rgba(217,119,6,.35)" : "1px solid var(--border)",
                  transition: "all .15s"
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--card2)"
                }}>
                  {p.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>1-2 business days</div>
                </div>
                {provider === p.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary & submit */}
        <div className="pf-card" style={{ padding: "22px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>You&apos;re withdrawing</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              ₹{amount ? parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>To</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedBank?.label}</span>
          </div>

          {result && (
            <div style={{
              marginBottom: 16, padding: "10px 14px",
              background: result.type === "success" ? "rgba(5,150,105,.08)" : "rgba(220,38,38,.08)",
              border: `1px solid ${result.type === "success" ? "rgba(5,150,105,.2)" : "rgba(220,38,38,.2)"}`,
              borderRadius: 8, fontSize: 12,
              color: result.type === "success" ? "#34D399" : "#F87171"
            }}>
              {result.message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !amount}
            style={{
              width: "100%", padding: 13, border: "none", borderRadius: 10,
              fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600, cursor: "pointer",
              color: "#fff", background: "linear-gradient(135deg, #D97706, #FBBF24)",
              boxShadow: "0 4px 20px rgba(217,119,6,.3)", transition: "all .2s",
              letterSpacing: "-.2px", opacity: (loading || !amount) ? 0.5 : 1
            }}
          >
            {loading ? "Processing…" : "Withdraw to Bank"}
          </button>
        </div>

      </div>
    </div>
  );
}