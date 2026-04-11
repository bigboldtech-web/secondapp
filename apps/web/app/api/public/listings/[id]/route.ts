import { NextResponse } from "next/server";
import { getListingById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(
    {
      listing: {
        id: listing.id,
        price: listing.price,
        originalPrice: listing.originalPrice,
        condition: listing.condition,
        specs: listing.specs,
        description: listing.description,
        photos: listing.photos,
        videoUrl: listing.videoUrl,
        viewCount: listing.viewCount,
        inquiryCount: listing.inquiryCount,
        createdAt: listing.createdAt.toISOString(),
        isFeatured: listing.isFeatured,
        adminCertified: listing.adminCertified,
        product: listing.product,
        vendor: listing.vendor,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
