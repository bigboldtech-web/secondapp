"use server";

import { prisma } from "@second-app/database";
import { revalidatePath } from "next/cache";

async function notifyEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY || !to) return;
  const from = process.env.EMAIL_FROM || "Second App <noreply@gosecond.in>";
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  }).catch(() => {});
}

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

  const user = await prisma.user.findUnique({ where: { id: vendor.userId }, select: { name: true, email: true } });
  if (user?.email) {
    void notifyEmail(user.email, "KYC approved — start selling on Second App",
      `Hi ${user.name},\n\nYour vendor account has been verified! You can now list products and start selling.\n\nGo to your dashboard: https://gosecond.in/vendor/dashboard\n\n— Second App`);
  }

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

  const user = await prisma.user.findUnique({ where: { id: vendor.userId }, select: { name: true, email: true } });
  if (user?.email) {
    void notifyEmail(user.email, "KYC verification update — Second App",
      `Hi ${user.name},\n\nYour vendor verification was not approved. Please re-submit with valid documents.\n\nRegister again: https://gosecond.in/vendor/register\n\n— Second App`);
  }

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
