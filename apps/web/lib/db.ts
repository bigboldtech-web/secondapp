import { prisma } from "@second-app/database";
import { parseSpecs, parsePhotos } from "./utils";
import { fullTextSearch, fullTextSearchBroad } from "./search/full-text";
import type {
  ListingCardData,
  ProductDetail,
  ProductListingData,
  ListingDetail,
  VendorProfile,
  CategoryWithCount,
} from "./types";

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  const listingCounts = await prisma.listing.groupBy({
    by: ["productId"],
    where: { status: "active" },
    _count: true,
  });

  const productCategories = await prisma.product.findMany({
    select: { id: true, categoryId: true },
  });

  const categoryListingCount = new Map<string, number>();
  for (const pc of productCategories) {
    const count = listingCounts
      .filter((lc) => lc.productId === pc.id)
      .reduce((sum, lc) => sum + lc._count, 0);
    categoryListingCount.set(
      pc.categoryId,
      (categoryListingCount.get(pc.categoryId) || 0) + count
    );
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    listingCount: categoryListingCount.get(c.id) || 0,
  }));
}

interface ListingFilters {
  categorySlug?: string | null;
  city?: string | null;
  search?: string | null;
  condition?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  limit?: number;
  offset?: number;
}

export async function getListings(filters: ListingFilters = {}): Promise<ListingCardData[]> {
  const where: Record<string, unknown> = { status: "active" };

  if (filters.categorySlug) {
    where.product = {
      category: { slug: filters.categorySlug },
    };
  }

  if (filters.city) {
    where.vendor = { locationCity: filters.city };
  }

  if (filters.condition) {
    where.condition = filters.condition;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice;
    if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice;
  }

  if (filters.search) {
    where.product = {
      ...(where.product as object || {}),
      displayName: { contains: filters.search, mode: "insensitive" },
    };
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      product: {
        include: {
          category: { select: { slug: true } },
        },
      },
      vendor: {
        select: {
          storeName: true,
          storeSlug: true,
          certificationLevel: true,
          locationCity: true,
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    take: filters.limit || 50,
    skip: filters.offset || 0,
  });

  return listings.map((l) => ({
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

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
      model: { select: { name: true, specsTemplate: true } },
      listings: {
        where: { status: "active" },
        include: {
          vendor: {
            select: {
              storeName: true,
              storeSlug: true,
              certificationLevel: true,
              ratingAvg: true,
              totalSales: true,
              locationCity: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
      },
    },
  });

  if (!product) return null;

  let specsTemplate: Record<string, string[]> | null = null;
  try {
    if (product.model.specsTemplate) {
      specsTemplate = JSON.parse(product.model.specsTemplate);
    }
  } catch {}

  return {
    id: product.id,
    slug: product.slug,
    displayName: product.displayName,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    brandName: product.brand.name,
    modelName: product.model.name,
    specsTemplate,
    listings: product.listings.map((l): ProductListingData => ({
      id: l.id,
      price: l.price,
      originalPrice: l.originalPrice,
      condition: l.condition,
      specs: parseSpecs(l.specs),
      thumbnail: parsePhotos(l.photos)[0] ?? null,
      description: l.description,
      vendorName: l.vendor.storeName,
      vendorSlug: l.vendor.storeSlug,
      vendorCertification: l.vendor.certificationLevel,
      vendorRating: l.vendor.ratingAvg,
      vendorSales: l.vendor.totalSales,
      location: l.vendor.locationCity || "India",
      createdAt: l.createdAt,
      isFeatured: l.isFeatured,
      adminCertified: l.adminCertified,
      viewCount: l.viewCount,
    })),
  };
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          model: { select: { name: true } },
        },
      },
      vendor: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          certificationLevel: true,
          ratingAvg: true,
          ratingCount: true,
          totalSales: true,
          locationCity: true,
          bio: true,
        },
      },
    },
  });

  if (!listing) return null;

  let photos: string[] = [];
  try {
    if (listing.photos) photos = JSON.parse(listing.photos);
  } catch {}

  return {
    id: listing.id,
    price: listing.price,
    originalPrice: listing.originalPrice,
    quantity: listing.quantity,
    condition: listing.condition,
    specs: parseSpecs(listing.specs),
    description: listing.description,
    photos,
    videoUrl: listing.videoUrl,
    viewCount: listing.viewCount,
    inquiryCount: listing.inquiryCount,
    createdAt: listing.createdAt,
    isFeatured: listing.isFeatured,
    adminCertified: listing.adminCertified,
    product: {
      slug: listing.product.slug,
      displayName: listing.product.displayName,
      category: listing.product.category,
      brand: listing.product.brand,
      model: listing.product.model,
    },
    vendor: {
      ...listing.vendor,
      avgResponseHours: await (async () => {
        const orders = await prisma.order.findMany({
          where: { vendorId: listing.vendorId, orderStatus: { in: ["confirmed", "shipped", "delivered"] } },
          select: { createdAt: true, updatedAt: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        if (orders.length < 3) return null;
        const totalH = orders.reduce((s, o) => s + (o.updatedAt.getTime() - o.createdAt.getTime()) / 3600000, 0);
        return Math.round(totalH / orders.length);
      })(),
    },
  };
}

export async function getSimilarListings(
  productId: string,
  excludeListingId: string,
  limit = 6
): Promise<ListingCardData[]> {
  const listings = await prisma.listing.findMany({
    where: {
      productId,
      id: { not: excludeListingId },
      status: "active",
    },
    include: {
      product: {
        include: { category: { select: { slug: true } } },
      },
      vendor: {
        select: {
          storeName: true,
          storeSlug: true,
          certificationLevel: true,
          locationCity: true,
        },
      },
    },
    orderBy: { price: "asc" },
    take: limit,
  });

  return listings.map((l) => ({
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

export async function getVendorBySlug(slug: string): Promise<VendorProfile | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { storeSlug: slug },
    include: {
      listings: {
        where: { status: "active" },
        include: {
          product: {
            include: { category: { select: { slug: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          buyer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!vendor) return null;

  const recentOrders = await prisma.order.findMany({
    where: { vendorId: vendor.id, orderStatus: { in: ["confirmed", "shipped", "delivered"] } },
    select: { createdAt: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  let avgResponseHours: number | null = null;
  if (recentOrders.length >= 3) {
    const totalHours = recentOrders.reduce((sum, o) => {
      return sum + (o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgResponseHours = Math.round(totalHours / recentOrders.length);
  }

  const videoCandidate = vendor.listings
    .filter((l) => !!l.videoUrl)
    .reduce<(typeof vendor.listings)[number] | null>((best, l) => {
      if (!best) return l;
      if (l.viewCount !== best.viewCount) return l.viewCount > best.viewCount ? l : best;
      return l.createdAt > best.createdAt ? l : best;
    }, null);

  const featuredVideoUrl = videoCandidate?.videoUrl ?? null;
  const featuredVideoPoster = videoCandidate ? parsePhotos(videoCandidate.photos)[0] ?? null : null;

  return {
    id: vendor.id,
    storeName: vendor.storeName,
    storeSlug: vendor.storeSlug,
    bio: vendor.bio,
    logoUrl: vendor.logoUrl,
    bannerUrl: vendor.bannerUrl,
    locationCity: vendor.locationCity,
    certificationLevel: vendor.certificationLevel,
    kycStatus: vendor.kycStatus,
    ratingAvg: vendor.ratingAvg,
    ratingCount: vendor.ratingCount,
    totalSales: vendor.totalSales,
    totalListings: vendor.listings.length,
    createdAt: vendor.createdAt,
    avgResponseHours,
    featuredVideoUrl,
    featuredVideoPoster,
    listings: vendor.listings.map((l) => {
      const photos = parsePhotos(l.photos);
      return {
        id: l.id,
        title: l.product.displayName,
        price: l.price,
        originalPrice: l.originalPrice,
        condition: l.condition,
        specs: parseSpecs(l.specs),
        thumbnail: photos[0] ?? null,
        videoUrl: l.videoUrl,
        photoCount: photos.length,
        vendorName: vendor.storeName,
        vendorSlug: vendor.storeSlug,
        vendorCertification: vendor.certificationLevel,
        productSlug: l.product.slug,
        categorySlug: l.product.category.slug,
        location: vendor.locationCity || "India",
        createdAt: l.createdAt,
        isFeatured: l.isFeatured,
        adminCertified: l.adminCertified,
      };
    }),
    reviews: vendor.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      buyerName: r.buyer.name,
      createdAt: r.createdAt,
    })),
  };
}

export async function searchListings(
  query: string,
  filters: Omit<ListingFilters, "search"> = {}
): Promise<ListingCardData[]> {
  if (!query || query.trim().length < 2) {
    return getListings(filters);
  }

  try {
    let results = await fullTextSearch(query, {
      categorySlug: filters.categorySlug,
      city: filters.city,
      condition: filters.condition,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      limit: filters.limit,
      offset: filters.offset,
    });

    if (results.length === 0) {
      results = await fullTextSearchBroad(query, {
        categorySlug: filters.categorySlug,
        city: filters.city,
        limit: filters.limit,
        offset: filters.offset,
      });
    }

    return results;
  } catch (err) {
    console.error("[search] fts pipeline failed, falling back to contains:", err);
    return getListings({ ...filters, search: query });
  }
}
