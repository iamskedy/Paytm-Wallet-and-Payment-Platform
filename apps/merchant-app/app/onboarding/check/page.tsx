import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

export default async function OnboardingCheck() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const merchant = await db.merchant.findUnique({
    where: { email: session.user.email },
    select: { number: true },
  });

  // Has phone number → go to dashboard
  if (merchant?.number) {
    redirect("/dashboard");
  }

  // No phone number → go to onboarding
  redirect("/onboarding");
}