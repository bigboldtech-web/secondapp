import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId, action, trackingNumber } = await request.json();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (action === "confirm") {
    await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "confirmed" } });
    await prisma.notification.create({
      data: { userId: order.buyerId, type: "order", title: "Order confirmed!", body: "The seller has confirmed your order and is preparing it for shipment." },
    });
  } else if (action === "ship") {
    await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "shipped", trackingNumber: trackingNumber || null } });
    await prisma.notification.create({
      data: { userId: order.buyerId, type: "order", title: "Order shipped!", body: `Your order is on the way.${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}` },
    });
  }

  return NextResponse.json({ success: true });
}
