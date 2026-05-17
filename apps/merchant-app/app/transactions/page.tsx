import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

function fmt(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function MerchantTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/api/auth/signin");

  const merchant = await db.merchant.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: {
        orderBy: { timestamp: "desc" },
        take: 50,
      }
    }
  });

  const txns = merchant?.transactions ?? [];

  // Separate user lookup — MerchantTransaction has no fromUser relation
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
  const avgAmount = txns.length ? Math.round(totalVolume / txns.length) : 0;

  return (
    <div>
      <div className="m-topbar">
        <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.3px" }}>
          Transactions
        </div>
      </div>

      <div style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          <div className="m-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Total Volume</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#10B981" }}>₹{fmt(totalVolume)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{txns.length} payments</div>
          </div>
          <div className="m-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Today</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#34D399" }}>₹{fmt(todayVolume)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
              {txns.filter((t: any) => new Date(t.timestamp).toDateString() === new Date().toDateString()).length} today
            </div>
          </div>
          <div className="m-stat">
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Avg. Payment</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "#5EEAD4" }}>₹{fmt(avgAmount)}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>per transaction</div>
          </div>
        </div>

        <div className="m-card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "rgba(16,185,129,.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>📋</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600 }}>Payment History</div>
            <span style={{
              marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
              background: "rgba(16,185,129,.12)", color: "#10B981", fontFamily: "var(--font-mono)"
            }}>{txns.length} total</span>
          </div>

          {txns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)", fontSize: 13 }}>
              No transactions yet. Share a payment link to start collecting!
            </div>
          ) : (
            txns.map((txn: any) => (
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
                      {new Date(txn.timestamp).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: "#34D399" }}>
                    +₹{fmt(txn.amount)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    #{String(txn.id).padStart(6, "0")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}