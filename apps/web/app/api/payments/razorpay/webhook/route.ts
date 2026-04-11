import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { verifyWebhookSignature } from "@/lib/payments";

// Razorpay webhook handler.
// Configure the endpoint in the Razorpay dashboard and set RAZORPAY_WEBHOOK_SECRET.
// We care about payment.captured (mark held), payment.failed (cancel order),
// refund.processed (mark refunded).
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; payload?: { payment?: { entity?: { id: string; order_id: string; notes?: { orderId?: string } } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.notes?.orderId;
  if (!orderId || !payment) {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ received: true });

  if (event.event === "payment.captured") {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "held", paymentId: payment.id },
    });
  } else if (event.event === "payment.failed") {
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: "cancelled", paymentStatus: "refunded" },
    });
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { status: "active" },
    });
  } else if (event.event === "refund.processed") {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "refunded" },
    });
  }

  return NextResponse.json({ received: true });
}
