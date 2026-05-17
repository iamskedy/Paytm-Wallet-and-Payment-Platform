"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function MerchantHome(): JSX.Element {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="m-login-bg">
      {/* Glow blobs — green/teal for merchant */}
      <div style={{
        position: "absolute", top: -150, left: -100,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(5,150,105,.18) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -100, right: -80,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(13,148,136,.12) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none"
      }} />

      {/* Card */}
      <div className="m-card m-anim-rise" style={{
        width: "100%", maxWidth: 440, padding: 40,
        margin: "0 16px", position: "relative", overflow: "hidden"
      }}>
        {/* Top shine — green */}
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 1,
          background: "linear-gradient(90deg, transparent, #10B981, transparent)"
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#059669,#0D9488)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 0 20px rgba(16,185,129,.35)"
          }}>🏢</div>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, letterSpacing: "-.5px" }}>
            PayFlow
          </span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 99,
            fontWeight: 500, fontFamily: "var(--font-mono)",
            background: "rgba(16,185,129,.15)", color: "#10B981",
            border: "1px solid rgba(16,185,129,.25)"
          }}>MERCHANT</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700, letterSpacing: "-.6px", marginBottom: 4 }}>
          Business portal
        </h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 32 }}>
          Access your merchant dashboard, settlements, and payment analytics.
        </p>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {[
            { icon: "⚡", text: "Real-time payment collection & settlement" },
            { icon: "🔐", text: "Webhook API with HMAC signature verification" },
            { icon: "📊", text: "Analytics dashboard with revenue reconciliation" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              fontSize: 13, color: "var(--text2)",
              animation: `m-up .5s ease ${0.1 + i * 0.12}s both`
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.18)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
              }}>{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%", padding: "13px 20px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: 10, cursor: "pointer",
            color: "var(--text)", fontSize: 14, fontWeight: 500,
            transition: "all .2s", marginBottom: 14,
            opacity: loading ? .6 : 1
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div style={{ position: "relative", margin: "16px 0" }}>
          <div style={{ height: 1, background: "var(--border)" }} />
          <span style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            background: "var(--card)", padding: "0 10px",
            fontSize: 11, color: "var(--text3)"
          }}>Business accounts only</span>
        </div>

        {/* Security badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px", borderRadius: 10,
          background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.14)"
        }}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>
            <span style={{ color: "var(--text2)", fontWeight: 500 }}>Bank-grade security</span>
            {" · "}256-bit encryption · RBI compliant · HMAC signed
          </div>
        </div>
      </div>
    </div>
  );
}
