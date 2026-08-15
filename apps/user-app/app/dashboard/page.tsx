import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";

function fmt(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin");

  const userId = parseInt(session.user.id);

  const [balance, onRamp, sent, received] = await Promise.all([
    db.balance.findUnique({ where: { userId } }),
    db.onRampTransaction.findMany({ where: { userId }, orderBy: { startTime: "desc" }, take: 5 }),
    db.p2pTransfer.findMany({
      where: { fromUserId: userId },
      include: { toUser: { select: { name: true, number: true } } },
      orderBy: { timestamp: "desc" }, take: 5
    }),
    db.p2pTransfer.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { name: true, number: true } } },
      orderBy: { timestamp: "desc" }, take: 5
    }),
  ]);

  // Merge and sort recent activity
  type TxnItem = { id: number; type: "topup" | "sent" | "received"; label: string; amount: number; date: Date; status?: string };
  const allTxns: TxnItem[] = [
    ...onRamp.map(t => ({ id: t.id, type: "topup" as const, label: `${t.provider} Top-up`, amount: t.amount, date: t.startTime, status: t.status })),
    ...sent.map(t => ({ id: t.id, type: "sent" as const, label: `To ${t.toUser.name ?? t.toUser.number}`, amount: t.amount, date: t.timestamp })),
    ...received.map(t => ({ id: t.id, type: "received" as const, label: `From ${t.fromUser.name ?? t.fromUser.number}`, amount: t.amount, date: t.timestamp })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  const totalSent = sent.reduce((a, t) => a + t.amount, 0);
  const totalReceived = received.reduce((a, t) => a + t.amount, 0);

  

  return (
    <div>
      {/* Topbar */}
      <div className="pf-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px", flex: 1 }}>
          Dashboard
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          Welcome back, <span style={{ color: "var(--text)", fontWeight: 500 }}>{session.user.name ?? "User"}</span>
        </div>
      </div>

      <div style={{ padding: 28 }}>

        {/* Balance Hero */}
        <div className="pf-card" style={{
          marginBottom: 24, padding: "28px 32px",
          background: "linear-gradient(135deg, #0D1F3C 0%, #111F35 60%, #0F2040 100%)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%)",
            filter: "blur(40px)"
          }} />
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Available Balance
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 42, fontWeight: 500, letterSpacing: "-2px", marginBottom: 6 }}>
            ₹{fmt(balance?.amount ?? 0)}
          </div>
          {balance?.locked ? (
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              ₹{fmt(balance.locked)} locked
            </div>
          ) : null}

          {/* Quick action buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <Link href="/transfer" style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(37,99,235,.2)", border: "1px solid rgba(37,99,235,.3)",
              color: "#93C5FD", fontSize: 13, fontWeight: 500, textDecoration: "none",
              transition: "all .2s"
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              Add Money
            </Link>
            <Link href="/p2p" style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(5,150,105,.2)", border: "1px solid rgba(5,150,105,.3)",
              color: "#6EE7B7", fontSize: 13, fontWeight: 500, textDecoration: "none",
              transition: "all .2s"
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Send Money
            </Link>
            <Link href="/withdraw" style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(217,119,6,.15)", border: "1px solid rgba(217,119,6,.25)",
              color: "#FBBF24", fontSize: 13, fontWeight: 500, textDecoration: "none",
              transition: "all .2s"
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              Withdraw
            </Link>
            <Link href="/transactions" style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.25)",
              color: "#C4B5FD", fontSize: 13, fontWeight: 500, textDecoration: "none",
              transition: "all .2s"
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              History
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className="pf-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Total Sent</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#F87171" }}>₹{fmt(totalSent)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{sent.length} transfers</div>
          </div>
          <div className="pf-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Total Received</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#34D399" }}>₹{fmt(totalReceived)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{received.length} transfers</div>
          </div>
          <div className="pf-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Top-ups</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#60A5FA" }}>
              ₹{fmt(onRamp.reduce((a, t) => a + t.amount, 0))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{onRamp.length} transactions</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pf-card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600 }}>Recent Activity</div>
            <Link href="/transactions" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
          </div>

          {allTxns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 13 }}>
              No transactions yet. Add money to get started!
            </div>
          ) : (
            <div>
              {allTxns.map(txn => (
                <div key={`${txn.type}-${txn.id}`} className="pf-txn-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                      background: txn.type === "topup"
                        ? "rgba(59,130,246,.12)"
                        : txn.type === "sent"
                          ? "rgba(220,38,38,.1)"
                          : "rgba(5,150,105,.1)"
                    }}>
                      {txn.type === "topup" ? "🏦" : txn.type === "sent" ? "↗" : "↙"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{txn.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                        {txn.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {txn.status && (
                          <span style={{
                            marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 4,
                            background: txn.status === "Success" ? "rgba(5,150,105,.15)" : txn.status === "Failure" ? "rgba(220,38,38,.1)" : "rgba(217,119,6,.1)",
                            color: txn.status === "Success" ? "#34D399" : txn.status === "Failure" ? "#F87171" : "#FBB350"
                          }}>
                            {txn.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500,
                    color: txn.type === "sent" ? "#F87171" : "#34D399"
                  }}>
                    {txn.type === "sent" ? "-" : "+"}₹{fmt(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}