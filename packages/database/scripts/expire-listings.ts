// Auto-expire active listings older than 60 days and demote expired boosts.
// Run daily via cron: tsx packages/database/scripts/expire-listings.ts
//
// Vendors can reactivate from the manage page if they still have stock.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EXPIRY_DAYS = 60;

async function main() {
  console.log("🕐 Running listing maintenance...");

  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // 1. Expire old active listings
  const expired = await prisma.listing.updateMany({
    where: {
      status: "active",
      createdAt: { lt: cutoff },
    },
    data: { status: "expired" },
  });
  console.log(`  expired ${expired.count} listing(s) older than ${EXPIRY_DAYS} days`);

  // 2. Demote boost flag on listings whose promotedUntil has passed
  const boosted = await prisma.listing.updateMany({
    where: {
      isPromoted: true,
      promotedUntil: { lt: new Date() },
    },
    data: { isPromoted: false, promotedUntil: null },
  });
  console.log(`  demoted ${boosted.count} expired boost(s)`);

  // 3. Notify vendors whose listings expired (batch — collect unique vendorIds)
  if (expired.count > 0) {
    const expiredListings = await prisma.listing.findMany({
      where: { status: "expired", createdAt: { lt: cutoff } },
      select: { vendorId: true },
      distinct: ["vendorId"],
    });
    for (const { vendorId } of expiredListings) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { userId: true },
      });
      if (vendor) {
        await prisma.notification.create({
          data: {
            userId: vendor.userId,
            type: "system",
            title: "Some listings expired",
            body: `Listings older than ${EXPIRY_DAYS} days have been auto-paused. Reactivate them from your dashboard if they're still available.`,
            data: JSON.stringify({ link: "/vendor/listings/manage" }),
          },
        }).catch(() => {});
      }
    }
  }

  console.log("✅ done");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
