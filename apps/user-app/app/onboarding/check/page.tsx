import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";
import { redirect } from "next/navigation";

export default async function OnboardingCheck() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { number: true },
  });

  // Has a real phone number → dashboard
  if (user?.number && !user.number.startsWith("google_")) {
    redirect("/dashboard");
  }

  // No phone → onboarding
  redirect("/onboarding");
}