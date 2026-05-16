"use client";
import { useState } from "react";
import { p2pTransfer } from "../lib/actions/p2pTransfer";

export default function P2PPage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    setStatus("loading");
    try {
      const amountInPaise = Math.round(parseFloat(amount) * 100);
      await p2pTransfer(phone, amountInPaise);
      setStatus("success");
      setMessage(`₹${amount} sent to ${phone} successfully!`);
      setPhone(""); setAmount("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Send Money</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Recipient Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="10-digit number"
            maxLength={10}
            className="w-full border rounded-lg p-3"
          />
        </div>
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
        <button
          onClick={handleSend}
          disabled={status === "loading" || !phone || !amount}
          className="w-full bg-green-600 text-white rounded-lg p-3 font-medium disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send Money"}
        </button>
        {message && (
          <p className={`text-sm mt-2 ${status === "success" ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}