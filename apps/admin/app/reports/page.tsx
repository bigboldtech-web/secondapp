import Link from "next/link";
import { prisma } from "@second-app/database";
import { requireAdmin } from "@/lib/auth";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireAdmin();

  const reports = await prisma.listingReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      listing: {
        include: {
          product: { select: { displayName: true } },
          vendor: { select: { storeName: true } },
        },
      },
      user: { select: { name: true, phone: true } },
    },
  });

  const serialized = reports.map((r) => ({
    id: r.id,
    listingId: r.listingId,
    productName: r.listing.product.displayName,
    vendorName: r.listing.vendor.storeName,
    reporterName: r.user.name,
    reporterPhone: r.user.phone || "",
    reason: r.reason,
    details: r.details,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ReportsClient reports={serialized} />;
}
