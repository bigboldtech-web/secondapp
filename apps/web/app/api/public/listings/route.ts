import { NextResponse } from "next/server";
import { getListings, searchListings } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/public/listings?category=phones&city=Mumbai&search=iphone&limit=20&offset=0
// No auth — browsable catalog is public on web and mobile.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);
  const search = url.searchParams.get("search");

  const filters = {
    categorySlug: url.searchParams.get("category"),
    city: url.searchParams.get("city"),
    condition: url.searchParams.get("condition"),
    minPrice: url.searchParams.get("minPrice") ? Number(url.searchParams.get("minPrice")) : null,
    maxPrice: url.searchParams.get("maxPrice") ? Number(url.searchParams.get("maxPrice")) : null,
    limit,
    offset,
  };

  const listings = search && search.trim().length >= 2
    ? await searchListings(search, filters)
    : await getListings(filters);

  return NextResponse.json(
    {
      listings: listings.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        originalPrice: l.originalPrice,
        condition: l.condition,
        specs: l.specs,
        thumbnail: l.thumbnail,
        vendorName: l.vendorName,
        vendorSlug: l.vendorSlug,
        vendorCertification: l.vendorCertification,
        productSlug: l.productSlug,
        categorySlug: l.categorySlug,
        location: l.location,
        createdAt: l.createdAt.toISOString(),
        isFeatured: l.isFeatured,
        adminCertified: l.adminCertified,
      })),
      limit,
      offset,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
