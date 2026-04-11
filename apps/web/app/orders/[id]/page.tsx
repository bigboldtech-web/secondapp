import Link from "next/link";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: { include: { product: { select: { displayName: true, slug: true } } } },
      vendor: { select: { storeName: true, storeSlug: true } },
      reviews: { select: { id: true, rating: true, comment: true } },
    },
  });

  if (!order || order.buyerId !== session.userId) notFound();

  const shippingAddr = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;

  return (
    <OrderDetailClient
      order={{
        id: order.id,
        productName: order.listing.product.displayName,
        productSlug: order.listing.product.slug,
        vendorName: order.vendor.storeName,
        vendorSlug: order.vendor.storeSlug,
        amount: order.amount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        shippingAddress: shippingAddr,
        hasReview: order.reviews.length > 0,
        review: order.reviews[0] || null,
        createdAt: order.createdAt.toISOString(),
      }}
    />
  );
}
