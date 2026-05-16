"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { useBalance } from "@repo/store/balance";

export default function MerchantHome() {
  const { data: session, status } = useSession();
  const balance = useBalance();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg">Loading session...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div>
        <Appbar onSignin={() => signIn("google", { callbackUrl: "/" })} onSignout={signOut} user={undefined} />
        <div className="flex justify-center mt-20">
          <button onClick={() => signIn("google", { callbackUrl: "/" })} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Appbar onSignin={() => signIn("google", { callbackUrl: "/" })} onSignout={signOut} user={session.user} />
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-2">Merchant Dashboard</h1>
        <p className="text-gray-500 mb-6">{session.user.email}</p>

        <div className="bg-teal-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-teal-600 mb-1">Total Balance</p>
          <p className="text-4xl font-bold text-teal-800">₹{(balance / 100).toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <a href="/transactions" className="bg-white border rounded-xl p-4 text-center hover:bg-gray-50">
            <p className="font-medium">Transaction History</p>
          </a>
          <a href="/payment-link" className="bg-white border rounded-xl p-4 text-center hover:bg-gray-50">
            <p className="font-medium">Generate Payment Link</p>
          </a>
        </div>
      </div>
    </div>
  );
}