"use client";
import { useState } from "react";
import { payMerchant } from "../lib/actions/payMerchant";

export function PayConfirmClient({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handlePay = async () => {
    setStatus("loading");
    try {
      await payMerchant(requestId);
      setStatus("success");
      setMessage("Payment successful!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Payment failed");
    }
  };

  if (status === "success") {
    return <p className="text-green-600 font-medium">{message}</p>;
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={status === "loading"}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
      >
        {status === "loading" ? "Processing..." : "Confirm & Pay"}
      </button>
      {status === "error" && <p className="text-sm text-red-500 mt-3">{message}</p>}
    </div>
  );
}