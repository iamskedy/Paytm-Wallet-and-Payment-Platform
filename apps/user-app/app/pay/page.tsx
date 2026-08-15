import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";
import { PayConfirmClient } from "./PayConfirmClient";

export default async function PayPage({
  searchParams
}: {
  searchParams: { to?: string; requestId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=/pay?to=${searchParams.to}&requestId=${searchParams.requestId}`);

  const { requestId, to } = searchParams;

  if (!requestId) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invalid Payment Link</h1>
        <p className="text-gray-500">No payment request was specified.</p>
      </div>
    );
  }

  const request = await db.paymentRequest.findUnique({
    where: { id: requestId },
    include: { merchant: true }
  });

  if (!request) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invalid Payment Link</h1>
        <p className="text-gray-500">This payment request doesn't exist.</p>
      </div>
    );
  }

  // Defense in depth: the merchantId in the URL should match the request's
  // actual merchant. requestId alone is authoritative for amount/description.
  if (to && Number(to) !== request.merchantId) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invalid Payment Link</h1>
        <p className="text-gray-500">This link appears to be corrupted.</p>
      </div>
    );
  }

  if (request.status !== "pending") {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Link No Longer Active</h1>
        <p className="text-gray-500">
          {request.status === "paid" ? "This payment has already been completed." : "This payment link has expired."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Confirm Payment</h1>
      <div className="bg-white border rounded-2xl p-6 text-center">
        <p className="text-gray-500 mb-1">Paying</p>
        <p className="text-lg font-medium mb-4">{request.merchant.name ?? request.merchant.email}</p>
        <p className="text-gray-500 mb-4">{request.description}</p>
        <div className="bg-teal-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-teal-600">Amount</p>
          <p className="text-4xl font-bold text-teal-800">₹{(request.amount / 100).toFixed(2)}</p>
        </div>
        <PayConfirmClient requestId={request.id} />
      </div>
    </div>
  );
}