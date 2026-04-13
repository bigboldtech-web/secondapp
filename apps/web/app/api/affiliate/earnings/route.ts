import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const clicks = await prisma.affiliateClick.findMany({
    where: { affiliateId: session.userId },
    select: { id: true, converted: true, commission: true, createdAt: true, listing: { select: { product: { select: { displayName: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalClicks = clicks.length;
  const conversions = clicks.filter((c) => c.converted);
  const totalEarnings = conversions.reduce((s, c) => s + c.commission, 0);

  return NextResponse.json({
    totalClicks,
    conversions: conversions.length,
    totalEarnings,
    clicks: clicks.map((c) => ({
      id: c.id,
      productName: c.listing.product.displayName,
      converted: c.converted,
      commission: c.commission,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}
