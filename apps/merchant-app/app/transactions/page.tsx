"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

export default function PaymentLink() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePaymentLink = () => {
    if (!amount || !description) return;
    const linkId = Math.random().toString(36).substring(2, 9);
    const link = `${window.location.origin}/pay/${linkId}?amount=${amount}&description=${encodeURIComponent(description)}`;
    setGeneratedLink(link);
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const reset = () => {
    setGeneratedLink("");
    setAmount("");
    setDescription("");
    setCopied(false);
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <div>
      {/* Topbar */}
      <div className="m-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px" }}>
          Payment Links
        </div>
      </div>

      <div style={{ padding: 28, maxWidth: 600 }}>

        {!generatedLink ? (
          <>
            {/* Amount input */}
            <div className="m-card" style={{ padding: "24px 28px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
                Payment Amount
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUICK_AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    style={{
                      padding: "7px 14px", borderRadius: 8,
                      background: amount === String(a) ? "rgba(16,185,129,.2)" : "var(--surface)",
                      border: amount === String(a) ? "1px solid rgba(16,185,129,.4)" : "1px solid var(--border2)",
                      color: amount === String(a) ? "#10B981" : "var(--text2)",
                      fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
                      transition: "all .15s"
                    }}
                  >
                    ₹{a.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="m-card" style={{ padding: "24px 28px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
                Payment Description
              </div>
              <input
                className="m-input"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Order #1042, Monthly subscription…"
                maxLength={100}
              />
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "right" }}>
                {description.length}/100
              </div>
            </div>

            {/* Preview & Generate */}
            <div className="m-card" style={{ padding: "22px 28px" }}>
              <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
                Preview
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Amount</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: amountNum > 0 ? "#10B981" : "var(--text3)" }}>
                  {amountNum > 0 ? `₹${amountNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Description</span>
                <span style={{ fontSize: 13, fontWeight: 500, maxWidth: "60%", textAlign: "right", color: description ? "var(--text)" : "var(--text3)" }}>
                  {description || "—"}
                </span>
              </div>
              <button
                className="m-btn"
                onClick={generatePaymentLink}
                disabled={!amount || !description}
              >
                Generate Payment Link
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="m-card" style={{ padding: "32px 28px" }}>
            {/* Success header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%", margin: "0 auto 14px",
                background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.25)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
              }}>✅</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 6 }}>
                Link Generated!
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                Share this link with your customer to collect ₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Link box */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: 10, padding: "14px 16px", marginBottom: 16,
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: "#5EEAD4", wordBreak: "break-all", lineHeight: 1.7
            }}>
              {generatedLink}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                  background: copied ? "rgba(16,185,129,.2)" : "var(--surface)",
                  border: copied ? "1px solid rgba(16,185,129,.35)" : "1px solid var(--border2)",
                  color: copied ? "#10B981" : "var(--text2)",
                  fontSize: 13, fontWeight: 500, transition: "all .2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: description, url: generatedLink });
                  }
                }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                  background: "var(--surface)", border: "1px solid var(--border2)",
                  color: "var(--text2)", fontSize: 13, fontWeight: 500,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
            </div>

            {/* Summary */}
            <div style={{
              padding: "12px 16px", borderRadius: 10,
              background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.14)",
              fontSize: 12, color: "var(--text3)", marginBottom: 20
            }}>
              <span style={{ color: "#10B981", fontWeight: 500 }}>₹{parseFloat(amount).toFixed(2)}</span>
              {" · "}
              {description}
            </div>

            <button
              onClick={reset}
              style={{
                width: "100%", padding: "11px", borderRadius: 10, cursor: "pointer",
                background: "none", border: "1px solid var(--border2)",
                color: "var(--text2)", fontSize: 13
              }}
            >
              + Generate Another Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
