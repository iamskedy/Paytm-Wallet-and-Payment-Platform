import db from "@repo/db/client";

export default async function PayPage({ params }: { params: { id: string } }) {
  const request = await db.paymentRequest.findUnique({
    where: { id: params.id }
  });

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Payment Link Not Found</h1>
          <p className="text-gray-500">This link is invalid.</p>
        </div>
      </div>
    );
  }

  if (request.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Link No Longer Active</h1>
          <p className="text-gray-500">
            {request.status === "paid" ? "This payment has already been completed." : "This payment link has expired."}
          </p>
        </div>
      </div>
    );
  }

  const userAppPayUrl = `http://localhost:3001/pay?to=${request.merchantId}&requestId=${request.id}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Payment Request</h1>
        <p className="text-gray-500 mb-6">{request.description}</p>
        <div className="bg-teal-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-teal-600">Amount</p>
          <p className="text-4xl font-bold text-teal-800">&#8377;{(request.amount / 100).toFixed(2)}</p>
        </div>
        <a
          href={userAppPayUrl}
          className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Pay Now
        </a>
        <p className="text-xs text-gray-400 mt-4">Payment ID: {request.id}</p>
      </div>
    </div>
  );
}