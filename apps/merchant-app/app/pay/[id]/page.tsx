"use client";
import { useSearchParams } from "next/navigation";

export default function PayPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const description = searchParams.get("description");

  const handlePayNow = () => {
    window.location.href = `http://localhost:3001/pay?to=${params.id}&amount=${amount}&description=${encodeURIComponent(description || "")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Payment Request</h1>
        <p className="text-gray-500 mb-6">{description}</p>
        <div className="bg-teal-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-teal-600">Amount</p>
          <p className="text-4xl font-bold text-teal-800">&#8377;{amount}</p>
        </div>
        <button
          onClick={handlePayNow}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Pay Now
        </button>
        <p className="text-xs text-gray-400 mt-4">Payment ID: {params.id}</p>
      </div>
    </div>
  );
}