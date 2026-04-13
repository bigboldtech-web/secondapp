"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { createPaymentOrder, paymentProvider, verifyPaymentSignature } from "@/lib/payments";
import { emailOrderPlaced, emailVendorNewOrder } from "@/lib/email-templates";

export async function createOrder(data: {
  listingId: string;
  quantity?: number;
  shippingAddress: { name: string; phone: string; address: string; city: string; pincode: string };
  paymentMethod: string;
}) {
  const session = await getSession();
  if (!session) return { error: "Please log in first" };

  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { vendor: true },
  });

  if (!listing || listing.status !== "active" || listing.quantity < 1) {
    return { error: "Listing no longer available" };
  }

  const orderQty = Math.max(1, Math.min(data.quantity ?? 1, listing.quantity));
  const orderAmount = listing.price * orderQty;
  const commissionRate = 0.07;
  const isCod = data.paymentMethod === "cod";

  const provider = paymentProvider();
  const initialPaymentStatus = isCod
    ? "pending"
    : provider === "mock"
      ? "held"
      : "pending";

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerId: session.userId,
      vendorId: listing.vendorId,
      amount: orderAmount,
      commissionAmount: Math.floor(orderAmount * commissionRate),
      paymentStatus: initialPaymentStatus,
      orderStatus: "placed",
      shippingAddress: JSON.stringify(data.shippingAddress),
    },
  });

  const newQty = listing.quantity - orderQty;
  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      quantity: Math.max(0, newQty),
      ...(newQty <= 0 ? { status: "sold" } : {}),
    },
  });

  let payment: Awaited<ReturnType<typeof createPaymentOrder>> | null = null;
  if (!isCod) {
    try {
      payment = await createPaymentOrder({
        amount: listing.price,
        receipt: order.id,
        notes: { orderId: order.id, buyerId: session.userId, vendorId: listing.vendorId },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: payment.externalId },
      });
    } catch (err) {
      await prisma.listing.update({ where: { id: listing.id }, data: { status: "active" } });
      await prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: "cancelled", paymentStatus: "refunded" },
      });
      return { error: "Payment gateway unavailable. Please try again." };
    }
  }

  await prisma.notification.create({
    data: {
      userId: listing.vendor.userId,
      type: "order",
      title: "New order received!",
      body: `Order for ₹${(orderAmount / 100).toLocaleString("en-IN")} received. Please confirm within 24 hours.`,
      data: JSON.stringify({ link: `/vendor/orders` }),
    },
  });

  const buyer = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } });
  const vendorUser = await prisma.user.findUnique({ where: { id: listing.vendor.userId }, select: { name: true, email: true } });
  const productName = (await prisma.product.findUnique({ where: { id: listing.productId }, select: { displayName: true } }))?.displayName ?? "Product";

  if (buyer?.email) {
    void emailOrderPlaced({ buyerEmail: buyer.email, buyerName: buyer.name, productName, amount: orderAmount, orderId: order.id });
  }
  if (vendorUser?.email) {
    void emailVendorNewOrder({ vendorEmail: vendorUser.email, vendorName: vendorUser.name, productName, amount: orderAmount, buyerName: buyer?.name ?? "A buyer" });
  }

  return {
    success: true,
    orderId: order.id,
    provider,
    paymentOrderId: payment?.externalId ?? null,
    razorpayKeyId: provider === "razorpay" ? process.env.RAZORPAY_KEY_ID ?? null : null,
    amount: listing.price,
  };
}

export async function confirmRazorpayPayment(args: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const order = await prisma.order.findUnique({ where: { id: args.orderId } });
  if (!order || order.buyerId !== session.userId) return { error: "Order not found" };

  const valid = verifyPaymentSignature({
    orderId: args.razorpayOrderId,
    paymentId: args.razorpayPaymentId,
    signature: args.razorpaySignature,
  });

  if (!valid) return { error: "Invalid payment signature" };

  await prisma.order.update({
    where: { id: args.orderId },
    data: { paymentStatus: "held", paymentId: args.razorpayPaymentId },
  });

  return { success: true };
}
