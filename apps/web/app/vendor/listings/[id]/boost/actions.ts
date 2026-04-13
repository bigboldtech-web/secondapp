"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BOOST_PRICES: Record<number, number> = {
  7: 99,
  14: 179,
  30: 299,
};

export async function boostListing(listingId: string, days: number) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { error: "Vendor account required" };

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { vendorId: true } });
  if (!listing || listing.vendorId !== vendor.id) return { error: "Not your listing" };

  const price = BOOST_PRICES[days];
  if (!price) return { error: "Invalid duration" };

  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.listing.update({
    where: { id: listingId },
    data: { isPromoted: true, promotedUntil: until },
  });

  revalidatePath("/vendor/listings/manage");
  revalidatePath(`/listing/${listingId}`);
  return { success: true, until: until.toISOString(), price };
}

export async function cancelBoost(listingId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { error: "Vendor account required" };

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { vendorId: true } });
  if (!listing || listing.vendorId !== vendor.id) return { error: "Not your listing" };

  await prisma.listing.update({
    where: { id: listingId },
    data: { isPromoted: false, promotedUntil: null },
  });

  revalidatePath("/vendor/listings/manage");
  return { success: true };
}
