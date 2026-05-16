import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin");

  const balance = await db.balance.findUnique({
    where: { userId: Number(session.user.id) }
  });

  const recentTxns = await db.onRampTransaction.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { startTime: "desc" },
    take: 5
  });

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-2">Welcome, {session.user.name}</h1>
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <p className="text-sm text-blue-600 mb-1">Total Balance</p>
        <p className="text-4xl font-bold text-blue-800">
          ₹{((balance?.amount ?? 0) / 100).toFixed(2)}
        </p>
        {balance?.locked ? (
          <p className="text-sm text-blue-400 mt-1">
            ₹{(balance.locked / 100).toFixed(2)} locked
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <a href="/transfer" className="bg-white border rounded-xl p-4 text-center hover:bg-gray-50">
          <p className="text-2xl mb-1">+</p>
          <p className="font-medium">Add Money</p>
        </a>
        <a href="/p2p" className="bg-white border rounded-xl p-4 text-center hover:bg-gray-50">
          <p className="text-2xl mb-1">→</p>
          <p className="font-medium">Send Money</p>
        </a>
      </div>

      <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
      {recentTxns.map(txn => (
        <div key={txn.id} className="flex justify-between items-center py-3 border-b">
          <div>
            <p className="font-medium">{txn.provider} Top-up</p>
            <p className="text-sm text-gray-400">{txn.startTime.toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-green-600">+₹{(txn.amount / 100).toFixed(2)}</p>
            <p className={`text-xs ${txn.status === "Success" ? "text-green-500" : txn.status === "Failure" ? "text-red-500" : "text-yellow-500"}`}>
              {txn.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}