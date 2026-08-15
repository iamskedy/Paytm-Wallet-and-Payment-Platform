"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWithdrawTransaction } from "../lib/actions/createWithdrawTransaction";

const PROVIDERS = ["HDFC", "SBI", "AXIS"];

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("HDFC");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      await createWithdrawTransaction(Math.round(parseFloat(amount) * 100), provider);
      setStatus("success");
      setMessage("Withdrawal successful!");
      setAmount("");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Withdraw Money</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border rounded-lg p-3 text-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Bank</label>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            {PROVIDERS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-medium disabled:opacity-50"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
        {message && (
          <p className={`text-sm mt-2 ${status === "success" ? "text-green-600" : status === "error" ? "text-red-500" : "text-gray-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}