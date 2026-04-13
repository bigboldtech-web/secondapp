"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface PlanConfig {
  price: number;
  maxListings: number;
  label: string;
}

export const PLANS: Record<string, PlanConfig> = {
  free:     { price: 0,    maxListings: 10,  label: "Free" },
  pro:      { price: 999,  maxListings: 999, label: "Pro" },
  business: { price: 2999, maxListings: 999, label: "Business" },
};

export async function upgradePlan(plan: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const config = PLANS[plan];
  if (!config) return { error: "Invalid plan" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { error: "Vendor account required" };

  if (plan === "free") {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { subscriptionPlan: "free", subscriptionEndsAt: null, maxListings: 10 },
    });
    revalidatePath("/vendor/subscription");
    return { success: true };
  }

  const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      subscriptionPlan: plan,
      subscriptionEndsAt: endsAt,
      maxListings: config.maxListings,
    },
  });

  revalidatePath("/vendor/subscription");
  revalidatePath("/vendor/dashboard");
  return { success: true, endsAt: endsAt.toISOString() };
}
