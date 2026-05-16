"use client";
import { useState } from "react";
import { createOnRampTransaction } from "../lib/actions/createOnRampTransaction";

const PROVIDERS = ["HDFC", "SBI", "AXIS"];

export default function TransferPage() {
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("HDFC");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const amountInPaise = Math.round(parseFloat(amount) * 100);
      const { token } = await createOnRampTransaction(amountInPaise, provider);
      setMessage(`Transaction created! Token: ${token}`);
      // In production: window.location.href = `https://bank.example.com/pay?token=${token}`
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Add Money</h1>
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
          {loading ? "Processing..." : "Add Money"}
        </button>
        {message && <p className="text-sm text-gray-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}