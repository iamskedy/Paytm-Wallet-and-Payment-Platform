import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

export default async function MerchantTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/api/auth/signin");

  const merchant = await db.merchant.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: { orderBy: { timestamp: "desc" }, take: 50 }
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Transactions</h1>
      {merchant?.transactions.map(txn => (
        <div key={txn.id} className="flex justify-between py-3 border-b">
          <div>
            <p className="text-sm text-gray-400">{txn.timestamp.toLocaleString()}</p>
            <p className="text-xs text-gray-300">from user #{txn.fromUserId}</p>
          </div>
          <p className="text-green-600 font-medium">+₹{(txn.amount/100).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}