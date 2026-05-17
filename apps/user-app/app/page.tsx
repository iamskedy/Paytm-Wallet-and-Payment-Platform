"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

const MERCHANT_APP_URL = process.env.NEXT_PUBLIC_MERCHANT_APP_URL || "http://localhost:3000";

export default function UserHome(): JSX.Element {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/onboarding/check" });
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = form.phone.replace(/\D/g, "");

    if (tab === "signup") {
      if (!form.name || !cleaned || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
      if (cleaned.length !== 10) { setError("Please enter a valid 10-digit phone number."); return; }
      if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    } else {
      if (!cleaned || !form.password) { setError("Please fill in all fields."); return; }
    }

    setSubmitting(true);
    try {
      if (tab === "signup") {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, number: cleaned, password: form.password }),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.message || "Signup failed. Please try again.");
          return;
        }
        // Auto sign in after signup
        const result = await signIn("credentials", { phone: cleaned, password: form.password, redirect: false });
        if (result?.error) { setError("Account created! Please sign in."); setTab("signin"); return; }
        window.location.href = "/dashboard";
      } else {
        const result = await signIn("credentials", { phone: cleaned, password: form.password, redirect: false });
        if (result?.error) { setError("Invalid phone number or password."); return; }
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#080E1A", color: "#EDF2FF", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />
      <div style={{ position: "fixed", top: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,.12) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Top nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,14,26,0.6)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 700, letterSpacing: "-.4px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💳</div>
          PayFlow
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Features", "Security", "Help"].map(l => (
            <a key={l} href="#" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, color: "#8899BB", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* 3-col layout */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "1fr 460px 1fr", alignItems: "center", padding: "100px 24px 40px", margin: "0 auto", minHeight: "100vh" }}>

        {/* Left panel */}
        <aside style={{ padding: "0 40px" }}>
          <div style={{ fontSize: "clamp(26px,3vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
            Money moves<br />at the speed<br />
            <span style={{ background: "linear-gradient(135deg,#2563EB,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>of trust</span>
          </div>
          <p style={{ fontSize: 14, color: "#8899BB", lineHeight: 1.7, maxWidth: 280, marginBottom: 36 }}>
            Send, receive, and manage your money with bank-grade security and real-time settlement.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "⚡", text: "Instant P2P transfers with idempotency" },
              { icon: "🔐", text: "HMAC-verified transactions, zero fraud risk" },
              { icon: "📊", text: "Spending analytics with real-time balance" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#8899BB" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "rgba(37,99,235,.12)", border: "1px solid rgba(37,99,235,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </aside>

        {/* Center card */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
          <div style={{ width: "100%", background: "#111E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg, transparent, #0EA5E9, transparent)" }} />

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 20px rgba(37,99,235,.35)" }}>💳</div>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.5px" }}>PayFlow</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: "rgba(37,99,235,.15)", color: "#0EA5E9", border: "1px solid rgba(37,99,235,.25)" }}>USER</span>
            </div>

            {/* User / Merchant switcher */}
            <div style={{ display: "flex", background: "#0D1526", borderRadius: 12, padding: 4, marginBottom: 20, border: "1px solid rgba(255,255,255,0.07)", position: "relative" }}>
              <div style={{ position: "absolute", top: 4, left: 4, width: "calc(50% - 4px)", height: "calc(100% - 8px)", borderRadius: 8, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", boxShadow: "0 2px 12px rgba(37,99,235,.3)" }} />
              <button style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", position: "relative", zIndex: 1 }}>👤 User</button>
              <button onClick={() => window.location.href = MERCHANT_APP_URL} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: "#5A6A8A", cursor: "pointer", position: "relative", zIndex: 1 }}>🏢 Merchant</button>
            </div>

            {/* Sign In / Sign Up tabs */}
            <div style={{ display: "flex", background: "#0D1526", borderRadius: 10, padding: 3, marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: tab === "signin" ? 3 : "calc(50%)", width: "calc(50% - 3px)", height: "calc(100% - 6px)", borderRadius: 7, background: "#1E3050", border: "1px solid rgba(255,255,255,0.1)", transition: "left .3s cubic-bezier(.4,0,.2,1)" }} />
              {(["signin", "signup"] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: tab === t ? "#EDF2FF" : "#5A6A8A", cursor: "pointer", position: "relative", zIndex: 1, transition: "color .25s" }}>
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.6px", marginBottom: 4 }}>
              {tab === "signin" ? "Welcome back" : "Create your wallet"}
            </h1>
            <p style={{ fontSize: 13, color: "#5A6A8A", marginBottom: 20 }}>
              {tab === "signin" ? "Sign in to your wallet account" : "Join millions managing money with PayFlow"}
            </p>

            {/* Google button */}
            <button onClick={handleGoogleSignIn} disabled={googleLoading} style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "#0D1526", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, cursor: googleLoading ? "not-allowed" : "pointer", color: "#EDF2FF", fontSize: 14, fontWeight: 500, transition: "all .2s", marginBottom: 16, opacity: googleLoading ? 0.6 : 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? "Redirecting…" : `${tab === "signin" ? "Sign in" : "Sign up"} with Google`}
            </button>

            <div style={{ position: "relative", margin: "16px 0" }}>
              <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#111E35", padding: "0 10px", fontSize: 11, color: "#5A6A8A" }}>or continue with credentials</span>
            </div>

            {/* Credentials form */}
            <form onSubmit={handleCredentials} noValidate>
              {tab === "signup" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8899BB", marginBottom: 7 }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", background: "#0D1526", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "11px 14px 11px 40px", fontSize: 14, color: "#EDF2FF", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>👤</span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8899BB", marginBottom: 7 }}>Phone number</label>
                <div style={{ position: "relative" }}>
                  <input type="tel" placeholder="10-digit phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={{ width: "100%", background: "#0D1526", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "11px 14px 11px 40px", fontSize: 14, color: "#EDF2FF", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>📱</span>
                </div>
              </div>

              <div style={{ marginBottom: tab === "signup" ? 14 : 8 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8899BB", marginBottom: 7 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: "100%", background: "#0D1526", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "11px 44px 11px 40px", fontSize: 14, color: "#EDF2FF", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔒</span>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#5A6A8A", padding: 2 }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>

              {tab === "signup" && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8899BB", marginBottom: 7 }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input type="password" placeholder="Confirm your password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} style={{ width: "100%", background: "#0D1526", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "11px 14px 11px 40px", fontSize: 14, color: "#EDF2FF", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔒</span>
                  </div>
                </div>
              )}

              {tab === "signin" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <a href="#" style={{ fontSize: 12, color: "#0EA5E9", textDecoration: "none" }}>Forgot password?</a>
                </div>
              )}

              {error && (
                <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "#EF4444", textAlign: "center" }}>{error}</div>
              )}

              <button type="submit" disabled={submitting} style={{ width: "100%", padding: "13px", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", color: "#fff", background: "linear-gradient(135deg,#2563EB,#0EA5E9)", boxShadow: "0 4px 20px rgba(37,99,235,.3)", opacity: submitting ? 0.7 : 1, transition: "all .25s", marginTop: tab === "signup" ? 16 : 0 }}>
                {submitting ? "Please wait…" : tab === "signin" ? "Sign in to wallet" : "Create wallet account"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 12, color: "#5A6A8A", marginTop: 20 }}>
              {tab === "signin" ? "New to PayFlow? " : "Already have an account? "}
              <button onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setError(""); }} style={{ background: "none", border: "none", color: "#0EA5E9", cursor: "pointer", fontSize: 12, fontWeight: 500, padding: 0 }}>
                {tab === "signin" ? "Create account →" : "Sign in →"}
              </button>
            </p>
          </div>
        </div>

        {/* Right panel */}
        <aside style={{ padding: "0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Total Processed Today", value: "₹84.2L", change: "↑ 12.4% vs yesterday" },
            { label: "Active Wallets", value: "1.24M", change: "↑ 3.1% this week" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#111E35", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#5A6A8A", textTransform: "uppercase", letterSpacing: ".07em" }}>{s.label}</div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0EA5E9", boxShadow: "0 0 6px #0EA5E9", animation: "pulse-dot 2s ease infinite" }} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 500, letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: "#10B981" }}>{s.change}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28, marginTop: 14 }}>
                {[40, 60, 45, 75, 55, 85, 100].map((h, j) => (
                  <div key={j} style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0", background: "#0EA5E9", opacity: j === 6 ? 1 : 0.35 }} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 12, background: "rgba(37,99,235,.06)", border: "1px solid rgba(37,99,235,.15)" }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#EDF2FF", marginBottom: 2 }}>Bank-grade security</div>
              <div style={{ fontSize: 11, color: "#5A6A8A" }}>256-bit encryption · RBI compliant · HMAC signed</div>
            </div>
          </div>
        </aside>
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 16, padding: "16px 40px 24px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {["Privacy Policy", "Terms of Service", "Security", "Help Center", "© 2026 PayFlow"].map(item => (
          <a key={item} href="#" style={{ fontSize: 11, color: "#5A6A8A", textDecoration: "none" }}>{item}</a>
        ))}
      </div>

      <style>{`@keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}} @media(max-width:900px){aside{display:none!important}} input:focus{border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important;outline:none!important}`}</style>
    </div>
  );
}