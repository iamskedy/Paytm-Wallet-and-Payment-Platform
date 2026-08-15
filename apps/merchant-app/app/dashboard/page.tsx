import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";


function fmt(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function MerchantDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/api/auth/signin");

  const merchant = await db.merchant.findUnique({
    where: { email: session.user.email },
    include: {
      balance: true,
      transactions: {
        orderBy: { timestamp: "desc" },
        take: 20,
      }
    }
  });

  const txns = merchant?.transactions ?? [];

  // MerchantTransaction has no fromUser relation — look up users separately
  const userIds = [...new Set(
    txns.map((t: any) => t.userId ?? t.fromUserId).filter((id: any) => id != null)
  )] as number[];

  const users = userIds.length
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, number: true }
      })
    : [];

  const userMap: Record<number, { name: string | null; number: string }> =
    Object.fromEntries(users.map((u: any) => [u.id, u]));

  const getUserLabel = (txn: any) => {
    const uid = txn.userId ?? txn.fromUserId;
    const u = userMap[uid];
    return u ? (u.name ?? u.number) : `User #${uid ?? "?"}`;
  };

  const totalVolume = txns.reduce((a: number, t: any) => a + t.amount, 0);
  const todayVolume = txns
    .filter((t: any) => new Date(t.timestamp).toDateString() === new Date().toDateString())
    .reduce((a: number, t: any) => a + t.amount, 0);
  const recentTxns = txns.slice(0, 8);

  return (
    <div>
      <div className="m-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px", flex: 1 }}>
          Dashboard
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          {session.user.name && (
            <>Welcome, <span style={{ color: "var(--text)", fontWeight: 500 }}>{session.user.name.split(" ")[0]}</span></>
          )}
        </div>
      </div>

      <div style={{ padding: 28 }}>
        {/* Hero */}
        <div className="m-card" style={{
          marginBottom: 24, padding: "28px 32px",
          background: "linear-gradient(135deg, #0A1F18 0%, #101F38 60%, #0B2030 100%)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,.18) 0%, transparent 70%)",
            filter: "blur(40px)"
          }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                Available Balance
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 42, fontWeight: 500, letterSpacing: "-2px", marginBottom: 4 }}>
                ₹{fmt(merchant?.balance?.amount ?? 0)}
              </div>
              {merchant?.balance?.locked ? (
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  ₹{fmt(merchant.balance.locked)} locked
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text3)" }}>₹{fmt(todayVolume)} collected today</div>
              )}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 99,
              background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.2)",
              fontSize: 12, color: "#10B981"
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#10B981",
                boxShadow: "0 0 6px #10B981", display: "inline-block", animation: "pulse 2s ease infinite"
              }} />
              Live
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <Link href="/transactions" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10,
              background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.25)",
              color: "#6EE7B7", fontSize: 13, fontWeight: 500, textDecoration: "none"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              Transactions
            </Link>
            <Link href="/payment-link" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10,
              background: "rgba(13,148,136,.15)", border: "1px solid rgba(13,148,136,.25)",
              color: "#5EEAD4", fontSize: 13, fontWeight: 500, textDecoration: "none"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Payment Link
            </Link>
            <Link href="/withdraw" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10,
              background: "rgba(217,119,6,.15)", border: "1px solid rgba(217,119,6,.25)",
              color: "#FBBF24", fontSize: 13, fontWeight: 500, textDecoration: "none"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              Withdraw
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          <div className="m-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Total Transactions</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 500, color: "#10B981" }}>{txns.length}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>all time</div>
          </div>
          <div className="m-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Today&apos;s Volume</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#34D399" }}>₹{fmt(todayVolume)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
              {txns.filter((t: any) => new Date(t.timestamp).toDateString() === new Date().toDateString()).length} payments
            </div>
          </div>
          <div className="m-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Avg. Transaction</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#5EEAD4" }}>
              ₹{txns.length ? fmt(Math.round(totalVolume / txns.length)) : "0.00"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>per payment</div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="m-card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600 }}>Recent Payments</div>
            <Link href="/transactions" style={{ fontSize: 12, color: "var(--acc)", textDecoration: "none" }}>View all →</Link>
          </div>
          {recentTxns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 13 }}>
              No payments yet. Share a payment link to get started!
            </div>
          ) : (
            recentTxns.map((txn: any) => (
              <div key={txn.id} className="m-txn-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: "rgba(16,185,129,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700, color: "#10B981"
                  }}>
                    {(getUserLabel(txn)[0] ?? "U").toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{getUserLabel(txn)}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      {new Date(txn.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: "#34D399" }}>
                  +₹{fmt(txn.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.6; transform:scale(1.3); }
        }
      `}</style>
    </div>
  );
}