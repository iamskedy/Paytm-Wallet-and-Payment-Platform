import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

function fmt(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function Transactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin");
  const userId = Number(session.user.id);

  const [onRamp, sent, received] = await Promise.all([
    db.onRampTransaction.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 50,
    }),
    db.p2pTransfer.findMany({
      where: { fromUserId: userId },
      include: { toUser: { select: { name: true, number: true } } },
      orderBy: { timestamp: "desc" },
      take: 50,
    }),
    db.p2pTransfer.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { name: true, number: true } } },
      orderBy: { timestamp: "desc" },
      take: 50,
    }),
  ]);

  const totalTopup = onRamp.reduce((a, t) => a + t.amount, 0);
  const totalSent = sent.reduce((a, t) => a + t.amount, 0);
  const totalReceived = received.reduce((a, t) => a + t.amount, 0);

  const statusColor = (s: string) =>
    s === "Success" ? "#34D399" : s === "Failure" ? "#F87171" : "#FBB350";
  const statusBg = (s: string) =>
    s === "Success" ? "rgba(5,150,105,.12)" : s === "Failure" ? "rgba(220,38,38,.1)" : "rgba(217,119,6,.1)";

  return (
    <div>
      {/* Topbar */}
      <div className="pf-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px" }}>
          Transactions
        </div>
      </div>

      <div style={{ padding: 28 }}>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          <div className="pf-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Added</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#60A5FA" }}>₹{fmt(totalTopup)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{onRamp.length} top-ups</div>
          </div>
          <div className="pf-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Sent</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#F87171" }}>₹{fmt(totalSent)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{sent.length} transfers</div>
          </div>
          <div className="pf-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Received</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#34D399" }}>₹{fmt(totalReceived)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{received.length} transfers</div>
          </div>
        </div>

        {/* Bank Top-ups */}
        <div className="pf-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "rgba(59,130,246,.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>🏦</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 600 }}>Bank Top-ups</div>
            <span style={{
              marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
              background: "rgba(59,130,246,.12)", color: "#60A5FA",
              fontFamily: "var(--font-mono)"
            }}>{onRamp.length}</span>
          </div>
          {onRamp.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 13 }}>No top-ups yet</div>
          ) : (
            onRamp.map(txn => (
              <div key={txn.id} className="pf-txn-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: "rgba(59,130,246,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
                  }}>🏛️</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{txn.provider}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      {txn.startTime.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "#34D399" }}>
                    +₹{fmt(txn.amount)}
                  </div>
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 4,
                    background: statusBg(txn.status), color: statusColor(txn.status)
                  }}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Money Sent */}
        <div className="pf-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "rgba(220,38,38,.1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>↗</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 600 }}>Money Sent</div>
            <span style={{
              marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
              background: "rgba(220,38,38,.1)", color: "#F87171",
              fontFamily: "var(--font-mono)"
            }}>{sent.length}</span>
          </div>
          {sent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 13 }}>No transfers sent</div>
          ) : (
            sent.map(txn => (
              <div key={txn.id} className="pf-txn-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: "rgba(220,38,38,.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
                  }}>👤</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {txn.toUser.name ?? txn.toUser.number}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      {txn.timestamp.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "#F87171" }}>
                  -₹{fmt(txn.amount)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Money Received */}
        <div className="pf-card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "rgba(5,150,105,.1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>↙</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 600 }}>Money Received</div>
            <span style={{
              marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
              background: "rgba(5,150,105,.12)", color: "#34D399",
              fontFamily: "var(--font-mono)"
            }}>{received.length}</span>
          </div>
          {received.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 13 }}>No transfers received</div>
          ) : (
            received.map(txn => (
              <div key={txn.id} className="pf-txn-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: "rgba(5,150,105,.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
                  }}>👤</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {txn.fromUser.name ?? txn.fromUser.number}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      {txn.timestamp.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "#34D399" }}>
                  +₹{fmt(txn.amount)}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
