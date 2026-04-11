"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";

export async function createOrder(data: {
  listingId: string;
  shippingAddress: { name: string; phone: string; address: string; city: string; pincode: string };
  paymentMethod: string;
}) {
  const session = await getSession();
  if (!session) return { error: "Please log in first" };

  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { vendor: true },
  });

  if (!listing || listing.status !== "active") return { error: "Listing no longer available" };

  const commissionRate = 0.07; // 7%

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerId: session.userId,
      vendorId: listing.vendorId,
      amount: listing.price,
      commissionAmount: Math.floor(listing.price * commissionRate),
      paymentStatus: data.paymentMethod === "cod" ? "pending" : "held",
      orderStatus: "placed",
      shippingAddress: JSON.stringify(data.shippingAddress),
    },
  });

  // Mark listing as sold
  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: "sold" },
  });

  // Notify vendor
  await prisma.notification.create({
    data: {
      userId: listing.vendor.userId,
      type: "order",
      title: "New order received!",
      body: `Order for ${listing.price / 100} received. Please confirm within 24 hours.`,
      data: JSON.stringify({ link: `/vendor/orders` }),
    },
  });

  return { success: true, orderId: order.id };
}
