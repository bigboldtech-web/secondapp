"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";

const VALID_REASONS = new Set(["spam", "fake", "offensive", "wrong_price", "other"]);

export async function reportListing(listingId: string, reason: string, details?: string) {
  const session = await getSession();
  if (!session) return { error: "Please log in to report a listing" };

  if (!VALID_REASONS.has(reason)) return { error: "Invalid reason" };

  const existing = await prisma.listingReport.findUnique({
    where: { listingId_userId: { listingId, userId: session.userId } },
  });
  if (existing) return { error: "You already reported this listing" };

  await prisma.listingReport.create({
    data: {
      listingId,
      userId: session.userId,
      reason,
      details: details?.slice(0, 500) || null,
    },
  });

  return { success: true };
}
