import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const listingId = url.searchParams.get("listing");
  const affiliateId = url.searchParams.get("ref");

  if (!listingId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (affiliateId) {
    const affiliate = await prisma.user.findUnique({ where: { id: affiliateId }, select: { id: true } });
    if (affiliate) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
      await prisma.affiliateClick.create({
        data: { listingId: listing.id, affiliateId: affiliate.id, ip },
      }).catch(() => {});
    }
  }

  return NextResponse.redirect(new URL(`/listing/${listing.id}`, req.url));
}
