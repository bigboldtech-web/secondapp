"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitReview(data: { orderId: string; rating: number; comment?: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: { vendor: true },
  });

  if (!order || order.buyerId !== session.userId) return { error: "Order not found" };
  if (order.orderStatus !== "delivered") return { error: "Order must be delivered first" };

  const existing = await prisma.review.findFirst({ where: { orderId: data.orderId } });
  if (existing) return { error: "Review already submitted" };

  await prisma.review.create({
    data: {
      orderId: data.orderId,
      buyerId: session.userId,
      vendorId: order.vendorId,
      listingId: order.listingId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  const allReviews = await prisma.review.findMany({
    where: { vendorId: order.vendorId },
    select: { rating: true },
  });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.vendor.update({
    where: { id: order.vendorId },
    data: { ratingAvg: avgRating, ratingCount: allReviews.length },
  });

  await prisma.notification.create({
    data: {
      userId: order.vendor.userId,
      type: "order",
      title: "New review received!",
      body: `${data.rating} star review: "${data.comment?.slice(0, 50) || "No comment"}"`,
      data: JSON.stringify({ link: `/store/${order.vendor.storeSlug}` }),
    },
  });

  revalidatePath(`/orders/${data.orderId}`);
  return { success: true };
}
