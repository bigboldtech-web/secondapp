// Check all active deal alerts against current listings and create
// notifications (+ send email) when a match is found.
// Run periodically: tsx packages/database/scripts/trigger-deal-alerts.ts
//
// A match = active listing whose product matches the alert's productId,
// price is at or below maxPrice (if set), and the listing was created
// or updated after the alert's lastTriggered timestamp.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sendAlertEmail(to: string, name: string, productName: string, price: number, listingId: string) {
  if (!process.env.RESEND_API_KEY || !to) return;
  const priceStr = `₹${Math.round(price / 100).toLocaleString("en-IN")}`;
  const from = process.env.EMAIL_FROM || "Second App <noreply@gosecond.in>";
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to,
      subject: `Deal alert: ${productName} at ${priceStr}`,
      text: `Hi ${name},\n\nA new listing matches your deal alert!\n\n${productName} — ${priceStr}\n\nView it: https://gosecond.in/listing/${listingId}\n\n— Second App`,
    }),
  }).catch(() => {});
}

async function main() {
  console.log("🔔 Checking deal alerts...");

  const alerts = await prisma.alert.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, displayName: true } },
    },
  });

  let triggered = 0;

  for (const alert of alerts) {
    const since = alert.lastTriggered ?? alert.createdAt;

    const match = await prisma.listing.findFirst({
      where: {
        productId: alert.productId,
        status: "active",
        ...(alert.maxPrice ? { price: { lte: alert.maxPrice } } : {}),
        updatedAt: { gt: since },
      },
      orderBy: { price: "asc" },
      select: { id: true, price: true },
    });

    if (!match) continue;

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: alert.userId,
        type: "alert",
        title: `Deal alert: ${alert.product.displayName}`,
        body: `₹${Math.round(match.price / 100).toLocaleString("en-IN")} — matches your alert!`,
        data: JSON.stringify({ link: `/listing/${match.id}` }),
      },
    });

    // Email
    if (alert.user.email) {
      void sendAlertEmail(alert.user.email, alert.user.name, alert.product.displayName, match.price, match.id);
    }

    // Update lastTriggered so we don't re-fire for the same listing
    await prisma.alert.update({
      where: { id: alert.id },
      data: { lastTriggered: new Date() },
    });

    triggered++;
  }

  console.log(`✅ ${triggered} alert(s) triggered out of ${alerts.length} active`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
