"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { useState } from "react";
import { createPaymentRequest } from "../lib/actions/createPaymentRequest";

export default function PaymentLink() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <Appbar onSignin={() => signIn("google", { callbackUrl: "/payment-link" })} onSignout={signOut} user={undefined} />
        <div className="flex justify-center mt-20">
          <button onClick={() => signIn("google", { callbackUrl: "/payment-link" })} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const generatePaymentLink = async () => {
    if (!amount || !description) return;
    setError("");
    setLoading(true);
    try {
      const amountInPaise = Math.round(parseFloat(amount) * 100);
      const { id } = await createPaymentRequest(amountInPaise, description);
      const link = `${window.location.origin}/pay/${id}`;
      setGeneratedLink(link);
    } catch (err: any) {
      setError(err.message ?? "Failed to generate payment link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Appbar onSignin={() => signIn("google", { callbackUrl: "/payment-link" })} onSignout={signOut} user={session.user} />
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-6">Generate Payment Link</h1>

        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter amount"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Payment description"
            />
          </div>

          <button
            onClick={generatePaymentLink}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!amount || !description || loading}
          >
            {loading ? "Generating..." : "Generate Payment Link"}
          </button>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>

        {generatedLink && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-2 text-green-800">Payment Link Generated!</h3>
            <p className="text-sm text-green-600 mb-3">Share this link with customers:</p>
            <div className="bg-white p-3 rounded border font-mono text-sm break-all">
              {generatedLink}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Copy Link
            </button>
          </div>
        )}

        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}