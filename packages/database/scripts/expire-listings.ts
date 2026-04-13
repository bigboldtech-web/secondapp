import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EXPIRY_DAYS = 60;

async function main() {
  console.log("🕐 Running listing maintenance...");

  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const expired = await prisma.listing.updateMany({
    where: {
      status: "active",
      createdAt: { lt: cutoff },
    },
    data: { status: "expired" },
  });
  console.log(`  expired ${expired.count} listing(s) older than ${EXPIRY_DAYS} days`);

  const boosted = await prisma.listing.updateMany({
    where: {
      isPromoted: true,
      promotedUntil: { lt: new Date() },
    },
    data: { isPromoted: false, promotedUntil: null },
  });
  console.log(`  demoted ${boosted.count} expired boost(s)`);

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
