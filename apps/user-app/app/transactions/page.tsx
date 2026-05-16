import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

export default async function Transactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin");
  const userId = Number(session.user.id);

  const [onRamp, sent, received] = await Promise.all([
    db.onRampTransaction.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 20
    }),
    db.p2pTransfer.findMany({
      where: { fromUserId: userId },
      include: { toUser: { select: { name: true, number: true } } },
      orderBy: { timestamp: "desc" },
      take: 20
    }),
    db.p2pTransfer.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { name: true, number: true } } },
      orderBy: { timestamp: "desc" },
      take: 20
    })
  ]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Transaction History</h1>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3 text-blue-600">Bank Top-ups</h2>
        {onRamp.map(txn => (
          <div key={txn.id} className="flex justify-between py-3 border-b">
            <div>
              <p className="font-medium">{txn.provider}</p>
              <p className="text-xs text-gray-400">{txn.startTime.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-green-600 font-medium">+₹{(txn.amount/100).toFixed(2)}</p>
              <p className={`text-xs ${txn.status === "Success" ? "text-green-500" : txn.status === "Failure" ? "text-red-500" : "text-yellow-500"}`}>{txn.status}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3 text-red-600">Money Sent</h2>
        {sent.map(txn => (
          <div key={txn.id} className="flex justify-between py-3 border-b">
            <div>
              <p className="font-medium">To: {txn.toUser.name || txn.toUser.number}</p>
              <p className="text-xs text-gray-400">{txn.timestamp.toLocaleString()}</p>
            </div>
            <p className="text-red-500 font-medium">-₹{(txn.amount/100).toFixed(2)}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3 text-green-600">Money Received</h2>
        {received.map(txn => (
          <div key={txn.id} className="flex justify-between py-3 border-b">
            <div>
              <p className="font-medium">From: {txn.fromUser.name || txn.fromUser.number}</p>
              <p className="text-xs text-gray-400">{txn.timestamp.toLocaleString()}</p>
            </div>
            <p className="text-green-600 font-medium">+₹{(txn.amount/100).toFixed(2)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}