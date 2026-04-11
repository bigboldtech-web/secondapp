"use server";

import { prisma } from "@second-app/database";
import { revalidatePath } from "next/cache";

export async function approveVendorKyc(vendorId: string) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { kycStatus: "verified", certificationLevel: "verified" },
  });

  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      type: "system",
      title: "KYC Approved!",
      body: "Your vendor account has been verified. You can now list products.",
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function rejectVendorKyc(vendorId: string) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { kycStatus: "rejected" },
  });

  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      type: "system",
      title: "KYC Rejected",
      body: "Your vendor verification was not approved. Please re-submit with valid documents.",
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function upgradeVendor(vendorId: string, level: string) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { certificationLevel: level },
  });

  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      type: "system",
      title: `Upgraded to ${level}!`,
      body: `Your vendor account has been upgraded to ${level} level.`,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function approveListing(listingId: string) {
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: "active" },
    include: { vendor: true },
  });

  await prisma.notification.create({
    data: {
      userId: listing.vendor.userId,
      type: "system",
      title: "Listing approved!",
      body: "Your listing is now live and visible to buyers.",
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function rejectListing(listingId: string, reason?: string) {
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: "rejected", rejectionReason: reason || "Does not meet quality standards" },
    include: { vendor: true },
  });

  await prisma.notification.create({
    data: {
      userId: listing.vendor.userId,
      type: "system",
      title: "Listing rejected",
      body: reason || "Your listing does not meet our quality standards.",
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function certifyListing(listingId: string) {
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { adminCertified: true },
    include: { vendor: true },
  });

  await prisma.notification.create({
    data: {
      userId: listing.vendor.userId,
      type: "system",
      title: "Listing certified!",
      body: "Your listing has been certified by Second App. It will get priority visibility.",
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function confirmVendorOrder(orderId: string) {
  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "confirmed" } });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order) {
    await prisma.notification.create({
      data: { userId: order.buyerId, type: "order", title: "Order confirmed!", body: "The seller has confirmed your order." },
    });
  }
  revalidatePath("/");
  return { success: true };
}

export async function shipVendorOrder(orderId: string, trackingNumber: string) {
  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "shipped", trackingNumber } });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order) {
    await prisma.notification.create({
      data: { userId: order.buyerId, type: "order", title: "Order shipped!", body: `Your order is on the way. Tracking: ${trackingNumber}` },
    });
  }
  revalidatePath("/");
  return { success: true };
}
