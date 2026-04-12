import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

type Action = "confirm" | "ship" | "cancel";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ error: "Vendor account required" }, { status: 403 });

  const body = (await request.json()) as { orderId?: string; action?: Action; trackingNumber?: string };
  const { orderId, action, trackingNumber } = body;
  if (!orderId || !action) return NextResponse.json({ error: "Missing orderId or action" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Ownership check — the previous route had NONE, so any logged-in user could
  // confirm/ship any order on the platform by guessing the id.
  if (order.vendorId !== vendor.id) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }

  if (action === "confirm") {
    if (order.orderStatus !== "placed") {
      return NextResponse.json({ error: "Only placed orders can be confirmed" }, { status: 400 });
    }
    await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "confirmed" } });
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "order",
        title: "Order confirmed!",
        body: "The seller has confirmed your order and is preparing it for shipment.",
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "ship") {
    if (order.orderStatus !== "confirmed") {
      return NextResponse.json({ error: "Only confirmed orders can be shipped" }, { status: 400 });
    }
    const tracking = trackingNumber?.trim() || null;
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: "shipped", trackingNumber: tracking },
    });
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "order",
        title: "Order shipped!",
        body: `Your order is on the way.${tracking ? ` Tracking: ${tracking}` : ""}`,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "cancel") {
    if (order.orderStatus !== "placed" && order.orderStatus !== "confirmed") {
      return NextResponse.json(
        { error: "Only placed or confirmed orders can be cancelled by the seller" },
        { status: 400 }
      );
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: "cancelled", paymentStatus: "refunded" },
    });
    // Return the unit to stock and reactivate the listing.
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { quantity: { increment: 1 }, status: "active" },
    });
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "order",
        title: "Order cancelled",
        body: "The seller cancelled your order. Your payment will be refunded.",
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
