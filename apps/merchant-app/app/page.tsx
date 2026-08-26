"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "http://localhost:3001";

export default function MerchantHome(): JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 15, color: "var(--text2)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="m-login-bg">
      <div style={{ position: "absolute", top: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,.2) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,.14) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Top nav */}
      <nav className="m-landing-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700, letterSpacing: "-.4px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#059669,#10B981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💳</div>
          PayFlow Pro
        </div>
        <div className="m-landing-nav-links" style={{ display: "flex", gap: 6 }}>
          {["Features", "Security", "Developers"].map(l => (
            <a key={l} href="#" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, color: "var(--text2)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* 3-col layout */}
      <div className="m-landing-grid">

        {/* Left panel */}
        <aside className="m-landing-aside" style={{ padding: "0 40px" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "clamp(26px,3vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
            Payments at<br />the speed of<br />
            <span style={{ background: "linear-gradient(135deg,#059669,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>trust</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, maxWidth: 280, marginBottom: 36 }}>
            Access your business dashboard, settlement reports, and real-time payment analytics.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "⚡", text: "Real-time payment collection & settlement" },
              { icon: "🔐", text: "Webhook API with HMAC signature verification" },
              { icon: "📊", text: "Analytics dashboard with revenue reconciliation" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--text2)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </aside>

        {/* Center card */}
        <div className="m-landing-center">
          <div className="m-card m-anim-rise" style={{ width: "100%", padding: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg, transparent, #10B981, transparent)" }} />

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#059669,#0D9488)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 20px rgba(16,185,129,.35)" }}>🏢</div>
              <span style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, letterSpacing: "-.5px" }}>PayFlow</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500, fontFamily: "var(--font-mono)", background: "rgba(16,185,129,.15)", color: "#10B981", border: "1px solid rgba(16,185,129,.25)" }}>MERCHANT</span>
            </div>

            {/* User / Merchant switcher */}
            <div style={{ display: "flex", background: "var(--surface)", borderRadius: 12, padding: 4, marginBottom: 20, border: "1px solid var(--border)", position: "relative" }}>
              <div style={{ position: "absolute", top: 4, right: 4, width: "calc(50% - 4px)", height: "calc(100% - 8px)", borderRadius: 8, background: "linear-gradient(135deg,#059669,#10B981)", boxShadow: "0 2px 12px rgba(5,150,105,.3)" }} />
              <button onClick={() => window.location.href = USER_APP_URL} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--text3)", cursor: "pointer", position: "relative", zIndex: 1 }}>👤 User</button>
              <button style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", position: "relative", zIndex: 1 }}>🏢 Merchant</button>
            </div>

            {/* Sign In / Sign Up tabs */}
            <div style={{ display: "flex", background: "var(--surface)", borderRadius: 10, padding: 3, marginBottom: 24, border: "1px solid var(--border)", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: tab === "signin" ? 3 : "calc(50%)", width: "calc(50% - 3px)", height: "calc(100% - 6px)", borderRadius: 7, background: "var(--card2)", border: "1px solid var(--border2)", transition: "left .3s cubic-bezier(.4,0,.2,1)" }} />
              {(["signin", "signup"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: tab === t ? "var(--text)" : "var(--text3)", cursor: "pointer", position: "relative", zIndex: 1, transition: "color .25s" }}>
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <h1 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, letterSpacing: "-.6px", marginBottom: 4 }}>
              {tab === "signin" ? "Business portal" : "Create merchant account"}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 28 }}>
              {tab === "signin" ? "Sign in with Google to access your dashboard." : "Sign up with Google to start accepting payments."}
            </p>

            <button onClick={handleGoogleSignIn} disabled={loading} className="m-btn" style={{ opacity: loading ? 0.6 : 1 }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {loading ? "Redirecting…" : `${tab === "signin" ? "Sign in" : "Sign up"} with Google`}
              </span>
            </button>

            <div style={{ margin: "16px 0", height: 1, background: "var(--border)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.14)" }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                <span style={{ color: "var(--text2)", fontWeight: 500 }}>Bank-grade security</span>{" · "}256-bit encryption · RBI compliant · HMAC signed
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", marginTop: 20 }}>
              {tab === "signin" ? "New merchant? " : "Already registered? "}
              <button onClick={() => setTab(tab === "signin" ? "signup" : "signin")} style={{ background: "none", border: "none", color: "var(--acc)", cursor: "pointer", fontSize: 12, fontWeight: 500, padding: 0 }}>
                {tab === "signin" ? "Create account →" : "Sign in →"}
              </button>
            </p>
          </div>
        </div>

        {/* Right panel */}
        <aside className="m-landing-aside" style={{ padding: "0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Merchant Volume Today", value: "₹12.4L", change: "↑ 8.3% vs yesterday" },
            { label: "Active Merchants", value: "48,200", change: "↑ 2.1% this week" },
          ].map((s, i) => (
            <div key={i} className="m-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em" }}>{s.label}</div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981", animation: "pulse 2s ease infinite" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 500, letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: "#10B981" }}>{s.change}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28, marginTop: 14 }}>
                {[40, 60, 45, 75, 55, 85, 100].map((h, j) => (
                  <div key={j} style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0", background: "#10B981", opacity: j === 6 ? 1 : 0.35 }} />
                ))}
              </div>
            </div>
          ))}
          <div className="m-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.15)" }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Bank-grade security</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>256-bit encryption · RBI compliant · HMAC signed</div>
            </div>
          </div>
        </aside>
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 16, padding: "16px 40px 24px", borderTop: "1px solid var(--border)" }}>
        {["Privacy Policy", "Terms of Service", "Security", "Help Center", "© 2026 PayFlow Pro"].map(item => (
          <a key={item} href="#" style={{ fontSize: 11, color: "var(--text3)", textDecoration: "none" }}>{item}</a>
        ))}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}

        .m-landing-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid var(--border);
          background: rgba(7,16,29,0.7);
          backdrop-filter: blur(12px);
        }

        .m-landing-grid {
          position: relative; z-index: 1;
          width: 100%; max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr 460px 1fr;
          align-items: start;
          padding: 100px 24px 40px;
          margin: 0 auto;
        }

        .m-landing-center {
          display: flex; align-items: center; justify-content: center;
          padding: 20px 0;
        }

        /* Below this, side panels are hidden and the grid collapses to a
           single centered column so the card actually goes full width
           instead of being stuck in its 460px track with dead space either side. */
        @media (max-width: 1100px) {
          .m-landing-grid {
            grid-template-columns: 1fr;
            padding-top: 90px;
          }
          .m-landing-aside { display: none !important; }
          .m-landing-center { padding: 0 16px; }
        }

        @media (max-width: 640px) {
          .m-landing-nav { padding: 14px 20px; }
          .m-landing-nav-links { display: none !important; }
          .m-landing-grid { padding: 80px 12px 24px; }
          .m-card.m-anim-rise { padding: 28px 20px !important; }
        }
      `}</style>
    </div>
  );
}