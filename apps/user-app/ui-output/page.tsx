"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page(): JSX.Element {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid phone number or password.");
    }
  };

  return (
    <div className="pf-login-bg">
      {/* Glow blobs */}
      <div style={{
        position: "absolute", top: -150, left: -100,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -100, right: -80,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,.12) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none"
      }} />

      {/* Card */}
      <div className="pf-card pf-anim-rise" style={{ width: "100%", maxWidth: 440, padding: 40, margin: "0 16px", position: "relative", overflow: "hidden" }}>
        {/* Top shine */}
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 1,
          background: "linear-gradient(90deg, transparent, #60A5FA, transparent)"
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#2563EB,#60A5FA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 0 20px rgba(37,99,235,.35)"
          }}>💳</div>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, letterSpacing: "-.5px" }}>PayFlow</span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 99,
            fontWeight: 500, fontFamily: "var(--font-mono)",
            background: "rgba(37,99,235,.15)", color: "#60A5FA",
            border: "1px solid rgba(37,99,235,.25)"
          }}>USER</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700, letterSpacing: "-.6px", marginBottom: 4 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 28 }}>
          Sign in to your wallet account
        </p>

        <form onSubmit={handleSubmit}>
          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 7 }}>
              Phone Number
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.57a16 16 0 0 0 6.29 6.29l1.64-1.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input
                className="pf-input"
                type="tel"
                placeholder="10-digit phone number"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 7 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                className="pf-input"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4
                }}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: "10px 14px",
              background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)",
              borderRadius: 8, fontSize: 12, color: "#EF4444", textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button className="pf-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to wallet"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", marginTop: 20 }}>
          New to PayFlow? Signing in with a new number creates your account automatically.
        </p>
      </div>
    </div>
  );
}
