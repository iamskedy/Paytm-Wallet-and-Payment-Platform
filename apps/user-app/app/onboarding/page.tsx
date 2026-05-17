"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UserOnboarding(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) { setError("Please enter a valid 10-digit phone number."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.message || "Something went wrong."); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080E1A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div style={{ background: "#111E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg, transparent, #0EA5E9, transparent)" }} />

          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12, border: "2px solid rgba(37,99,235,.3)" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12, boxShadow: "0 0 24px rgba(37,99,235,.3)" }}>💳</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0EA5E9", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Welcome aboard</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", color: "#EDF2FF" }}>
              {session?.user?.name?.split(" ")[0] ?? "There"} 👋
            </div>
            <div style={{ fontSize: 13, color: "#8899BB", marginTop: 6, textAlign: "center" }}>
              One last step — add your phone number to activate your wallet.
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0EA5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
              <span style={{ fontSize: 12, color: "#8899BB" }}>Account created</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>2</div>
              <span style={{ fontSize: 12, color: "#EDF2FF", fontWeight: 500 }}>Phone number</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#5A6A8A" }}>3</div>
              <span style={{ fontSize: 12, color: "#5A6A8A" }}>Your wallet</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8899BB", marginBottom: 8 }}>Phone number</label>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>📱</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                style={{ width: "100%", background: "#0D1526", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "11px 14px 11px 40px", fontSize: 14, color: "#EDF2FF", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                autoFocus
              />
            </div>
            <div style={{ fontSize: 11, color: "#5A6A8A", marginBottom: 24 }}>
              Used for transaction alerts and account recovery. Never shared.
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "#EF4444", textAlign: "center" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff", background: "linear-gradient(135deg,#2563EB,#0EA5E9)", boxShadow: "0 4px 20px rgba(37,99,235,.3)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Activating wallet…" : "Activate my wallet →"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "rgba(37,99,235,.06)", border: "1px solid rgba(37,99,235,.14)" }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <div style={{ fontSize: 11, color: "#5A6A8A" }}>Your phone number is encrypted and never shared with third parties.</div>
          </div>
        </div>
      </div>
    </div>
  );
}