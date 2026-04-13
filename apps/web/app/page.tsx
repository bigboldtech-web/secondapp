import { prisma } from "@second-app/database";
import { getListings, getCategoriesWithCounts } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseSpecs, parsePhotos } from "@/lib/utils";
import { getPersonalizedListingIds } from "@/lib/personalize";
import Homepage from "@/components/Homepage";
import type { ListingCardData } from "@/lib/types";

export default async function Home() {
  const [listings, categories, session] = await Promise.all([
    getListings({ limit: 50 }),
    getCategoriesWithCounts(),
    getSession(),
  ]);

  // Fetch recently viewed for logged-in users (last 10, active only).
  let recentlyViewed: ListingCardData[] = [];
  if (session) {
    try {
      const recent = await prisma.recentlyViewed.findMany({
        where: { userId: session.userId },
        orderBy: { viewedAt: "desc" },
        take: 10,
        include: {
          listing: {
            include: {
              product: { include: { category: { select: { slug: true } } } },
              vendor: { select: { storeName: true, storeSlug: true, certificationLevel: true, locationCity: true } },
            },
          },
        },
      });
      recentlyViewed = recent
        .filter((r) => r.listing.status === "active")
        .map((r) => {
          const l = r.listing;
          return {
            id: l.id,
            title: l.product.displayName,
            price: l.price,
            originalPrice: l.originalPrice,
            condition: l.condition,
            specs: parseSpecs(l.specs),
            thumbnail: parsePhotos(l.photos)[0] ?? null,
            vendorName: l.vendor.storeName,
            vendorSlug: l.vendor.storeSlug,
            vendorCertification: l.vendor.certificationLevel,
            productSlug: l.product.slug,
            categorySlug: l.product.category.slug,
            location: l.vendor.locationCity || "India",
            createdAt: l.createdAt,
            isFeatured: l.isFeatured,
            adminCertified: l.adminCertified,
          };
        });
    } catch { /* silently skip if table doesn't exist yet */ }
  }

  // Personalized "For you" — collaborative filtering on recently-viewed overlap.
  let forYou: ListingCardData[] = [];
  if (session) {
    try {
      const ids = await getPersonalizedListingIds(session.userId, 10);
      if (ids.length > 0) {
        const personalizedListings = await prisma.listing.findMany({
          where: { id: { in: ids }, status: "active" },
          include: {
            product: { include: { category: { select: { slug: true } } } },
            vendor: { select: { storeName: true, storeSlug: true, certificationLevel: true, locationCity: true } },
          },
        });
        forYou = personalizedListings.map((l) => ({
          id: l.id,
          title: l.product.displayName,
          price: l.price,
          originalPrice: l.originalPrice,
          condition: l.condition,
          specs: parseSpecs(l.specs),
          thumbnail: parsePhotos(l.photos)[0] ?? null,
          vendorName: l.vendor.storeName,
          vendorSlug: l.vendor.storeSlug,
          vendorCertification: l.vendor.certificationLevel,
          productSlug: l.product.slug,
          categorySlug: l.product.category.slug,
          location: l.vendor.locationCity || "India",
          createdAt: l.createdAt,
          isFeatured: l.isFeatured,
          adminCertified: l.adminCertified,
        }));
      }
    } catch { /* silently skip */ }
  }

  return (
    <Homepage
      listings={listings}
      categories={categories}
      isLoggedIn={!!session}
      userName={session?.user?.name}
      recentlyViewed={recentlyViewed}
      forYou={forYou}
    />
  );
}
