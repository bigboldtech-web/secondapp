import { redirect } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import SubscriptionClient from "./SubscriptionClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) redirect("/vendor/register");

  return (
    <SubscriptionClient
      current={{
        plan: vendor.subscriptionPlan,
        endsAt: vendor.subscriptionEndsAt?.toISOString() ?? null,
        maxListings: vendor.maxListings,
        totalListings: vendor.totalListings,
      }}
    />
  );
}
