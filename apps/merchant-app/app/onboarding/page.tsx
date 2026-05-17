"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function MerchantOnboarding(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-login-bg">
      <div style={{ position: "absolute", top: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,.2) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, padding: "0 24px" }}>
        <div className="m-card m-anim-rise" style={{ padding: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg, transparent, #10B981, transparent)" }} />

          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12, border: "2px solid rgba(16,185,129,.3)" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#059669,#0D9488)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12, boxShadow: "0 0 24px rgba(16,185,129,.3)" }}>🏢</div>
            )}
            <div style={{ fontFamily: "var(--font-head)", fontSize: 11, fontWeight: 600, color: "var(--acc)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Welcome aboard</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, letterSpacing: "-.5px" }}>
              {session?.user?.name?.split(" ")[0] ?? "Merchant"} 👋
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, textAlign: "center" }}>
              One last step — add your phone number to activate your merchant account.
            </div>
          </div>

          {/* Progress indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--acc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>Google Sign-in</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "var(--border2)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#059669,#10B981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>2</div>
              <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>Phone number</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text3)" }}>3</div>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>Dashboard</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 8 }}>
              Business phone number
            </label>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>📱</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(val);
                  setError("");
                }}
                className="m-input"
                style={{ paddingLeft: 42 }}
                autoFocus
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 24 }}>
              This number will be used for transaction alerts and account recovery.
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 8, fontSize: 12, color: "#EF4444", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="m-btn">
              {loading ? "Activating account…" : "Activate merchant account →"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.14)" }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Your phone number is encrypted and never shared with third parties.</div>
          </div>
        </div>
      </div>
    </div>
  );
}