"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMyOrders() {
  const session = await getSession();
  if (!session) return [];

  const orders = await prisma.order.findMany({
    where: { buyerId: session.userId },
    include: {
      listing: { include: { product: { select: { displayName: true, slug: true } } } },
      vendor: { select: { storeName: true, storeSlug: true } },
      reviews: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    productName: o.listing.product.displayName,
    productSlug: o.listing.product.slug,
    vendorName: o.vendor.storeName,
    vendorSlug: o.vendor.storeSlug,
    amount: o.amount,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    trackingNumber: o.trackingNumber,
    hasReview: o.reviews.length > 0,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function confirmDelivery(orderId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.userId) return { error: "Order not found" };
  if (order.orderStatus !== "shipped") return { error: "Order must be shipped first" };

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: "delivered", paymentStatus: "released" },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function cancelOrder(orderId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.userId) return { error: "Order not found" };
  if (order.orderStatus !== "placed") return { error: "Can only cancel placed orders" };

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: "cancelled", paymentStatus: "refunded" },
  });

  // Return the unit to stock and reactivate the listing.
  await prisma.listing.update({
    where: { id: order.listingId },
    data: { quantity: { increment: 1 }, status: "active" },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}
