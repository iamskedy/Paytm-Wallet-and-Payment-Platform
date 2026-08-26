"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { useState } from "react";
import { createPaymentRequest } from "../lib/actions/createPaymentRequest";

export default function PaymentLink() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 15, color: "var(--text2)" }}>Loading session...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div>
        <Appbar onSignin={() => signIn("google", { callbackUrl: "/payment-link" })} onSignout={signOut} user={undefined} />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
          <button className="m-btn" style={{ width: "auto", padding: "13px 28px" }} onClick={() => signIn("google", { callbackUrl: "/payment-link" })}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const generatePaymentLink = async () => {
    if (!amount || !description) return;
    setError("");
    setLoading(true);
    try {
      const amountInPaise = Math.round(parseFloat(amount) * 100);
      const { id } = await createPaymentRequest(amountInPaise, description);
      const link = `${window.location.origin}/pay/${id}`;
      setGeneratedLink(link);
    } catch (err: any) {
      setError(err.message ?? "Failed to generate payment link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Appbar onSignin={() => signIn("google", { callbackUrl: "/payment-link" })} onSignout={signOut} user={session.user} />

      <div style={{ padding: 28, maxWidth: 560 }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, letterSpacing: "-.3px", marginBottom: 20 }}>
          Generate Payment Link
        </div>

        <div className="m-card" style={{ padding: "28px 28px", marginBottom: 20 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
              Amount (₹)
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="m-input"
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
              Description
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
              className="m-input"
            />
          </div>

          <button
            onClick={generatePaymentLink}
            className="m-btn"
            disabled={!amount || !description || loading}
          >
            {loading ? "Generating…" : "Generate Payment Link"}
          </button>

          {error && (
            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)",
              borderRadius: 8, fontSize: 12, color: "#F87171"
            }}>
              {error}
            </div>
          )}
        </div>

        {generatedLink && (
          <div className="m-card" style={{
            padding: "24px 28px",
            background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.25)"
          }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600, color: "#6EE7B7", marginBottom: 4 }}>
              Payment Link Generated!
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>
              Share this link with customers:
            </div>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 10,
              padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 13,
              color: "var(--text)", wordBreak: "break-all", marginBottom: 14
            }}>
              {generatedLink}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              style={{
                padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 600,
                color: "#fff", background: "linear-gradient(135deg, #059669, #10B981)"
              }}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}