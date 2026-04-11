import { prisma } from "@second-app/database";
import { parseSpecs } from "./utils";
import type {
  ListingCardData,
  ProductDetail,
  ProductListingData,
  ListingDetail,
  VendorProfile,
  CategoryWithCount,
} from "./types";

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  // Get listing counts per category
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

// ============================================================
// LISTINGS (for homepage and grids)
// ============================================================

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

// ============================================================
// PRODUCT DETAIL (for product grouping page)
// ============================================================

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
  } catch { /* ignore */ }

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

// ============================================================
// LISTING DETAIL (for individual listing page)
// ============================================================

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
  } catch { /* ignore */ }

  return {
    id: listing.id,
    price: listing.price,
    originalPrice: listing.originalPrice,
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
    vendor: listing.vendor,
  };
}

/**
 * Get similar listings (same product, excluding current listing)
 */
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

// ============================================================
// VENDOR PROFILE (for store page)
// ============================================================

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
    listings: vendor.listings.map((l) => ({
      id: l.id,
      title: l.product.displayName,
      price: l.price,
      originalPrice: l.originalPrice,
      condition: l.condition,
      specs: parseSpecs(l.specs),
      vendorName: vendor.storeName,
      vendorSlug: vendor.storeSlug,
      vendorCertification: vendor.certificationLevel,
      productSlug: l.product.slug,
      categorySlug: l.product.category.slug,
      location: vendor.locationCity || "India",
      createdAt: l.createdAt,
      isFeatured: l.isFeatured,
      adminCertified: l.adminCertified,
    })),
    reviews: vendor.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      buyerName: r.buyer.name,
      createdAt: r.createdAt,
    })),
  };
}

// ============================================================
// SEARCH
// ============================================================

export async function searchListings(
  query: string,
  filters: Omit<ListingFilters, "search"> = {}
): Promise<ListingCardData[]> {
  return getListings({ ...filters, search: query });
}
