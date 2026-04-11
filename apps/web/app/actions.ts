"use server";

import { prisma } from "@second-app/database";
import { revalidatePath } from "next/cache";

// ============================================================
// DEAL ALERTS
// ============================================================

export async function createAlert(data: {
  productSlug: string;
  maxPrice?: number;
  condition?: string;
  specs?: Record<string, string>;
}) {
  // For MVP, use first buyer user
  const user = await prisma.user.findFirst({ where: { role: "buyer" } });
  if (!user) return { error: "Please log in first" };

  const product = await prisma.product.findUnique({ where: { slug: data.productSlug } });
  if (!product) return { error: "Product not found" };

  const alert = await prisma.alert.create({
    data: {
      userId: user.id,
      productId: product.id,
      maxPrice: data.maxPrice ? data.maxPrice * 100 : null,
      conditionMin: data.condition || null,
      filters: data.specs ? JSON.stringify(data.specs) : null,
    },
  });

  return { success: true, alertId: alert.id };
}

export async function deleteAlert(alertId: string) {
  await prisma.alert.delete({ where: { id: alertId } });
  revalidatePath("/alerts");
  return { success: true };
}

export async function getMyAlerts() {
  const user = await prisma.user.findFirst({ where: { role: "buyer" } });
  if (!user) return [];

  const alerts = await prisma.alert.findMany({
    where: { userId: user.id, isActive: true },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true } },
          _count: { select: { listings: { where: { status: "active" } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((a) => ({
    id: a.id,
    productName: a.product.displayName,
    productSlug: a.product.slug,
    categoryName: a.product.category.name,
    brandName: a.product.brand.name,
    maxPrice: a.maxPrice ? a.maxPrice / 100 : null,
    conditionMin: a.conditionMin,
    activeListings: a.product._count.listings,
    createdAt: a.createdAt.toISOString(),
  }));
}

// ============================================================
// SAVED / WISHLIST (using Collections)
// ============================================================

export async function toggleSaveListing(listingId: string) {
  const user = await prisma.user.findFirst({ where: { role: "buyer" } });
  if (!user) return { error: "Please log in first" };

  // Get or create default wishlist
  let wishlist = await prisma.collection.findFirst({
    where: { userId: user.id, name: "Saved Items" },
  });

  if (!wishlist) {
    wishlist = await prisma.collection.create({
      data: { userId: user.id, name: "Saved Items", isPublic: false },
    });
  }

  // Check if already saved
  const existing = await prisma.collectionItem.findFirst({
    where: { collectionId: wishlist.id, listingId },
  });

  if (existing) {
    await prisma.collectionItem.delete({ where: { id: existing.id } });
    return { saved: false };
  } else {
    await prisma.collectionItem.create({
      data: { collectionId: wishlist.id, listingId },
    });
    return { saved: true };
  }
}

export async function getMySavedListings() {
  const user = await prisma.user.findFirst({ where: { role: "buyer" } });
  if (!user) return [];

  const wishlist = await prisma.collection.findFirst({
    where: { userId: user.id, name: "Saved Items" },
    include: {
      items: {
        include: {
          listing: {
            include: {
              product: { include: { category: { select: { slug: true } } } },
              vendor: { select: { storeName: true, storeSlug: true, certificationLevel: true, locationCity: true } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!wishlist) return [];

  return wishlist.items
    .filter((item) => item.listing.status === "active")
    .map((item) => {
      const l = item.listing;
      const specs: Record<string, string> = l.specs ? JSON.parse(l.specs) : {};
      const photos: string[] = l.photos ? (() => { try { const p = JSON.parse(l.photos); return Array.isArray(p) ? p : []; } catch { return []; } })() : [];
      return {
        id: l.id,
        title: l.product.displayName,
        price: l.price,
        originalPrice: l.originalPrice,
        condition: l.condition,
        specs,
        thumbnail: photos[0] ?? null,
        vendorName: l.vendor.storeName,
        vendorSlug: l.vendor.storeSlug,
        vendorCertification: l.vendor.certificationLevel,
        productSlug: l.product.slug,
        categorySlug: l.product.category.slug,
        location: l.vendor.locationCity || "India",
        createdAt: l.createdAt,
        isFeatured: l.isFeatured,
        adminCertified: l.adminCertified,
        savedAt: item.addedAt.toISOString(),
      };
    });
}

// ============================================================
// VENDOR LISTING MANAGEMENT
// ============================================================

export async function updateListingStatus(listingId: string, status: string) {
  await prisma.listing.update({
    where: { id: listingId },
    data: { status },
  });
  revalidatePath("/vendor/listings/manage");
  return { success: true };
}

export async function deleteListing(listingId: string) {
  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/vendor/listings/manage");
  return { success: true };
}

export async function getVendorListings() {
  // For MVP use first vendor
  const vendor = await prisma.vendor.findFirst({ orderBy: { createdAt: "asc" } });
  if (!vendor) return [];

  const listings = await prisma.listing.findMany({
    where: { vendorId: vendor.id },
    include: {
      product: { select: { displayName: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return listings.map((l) => ({
    id: l.id,
    productName: l.product.displayName,
    productSlug: l.product.slug,
    price: l.price,
    condition: l.condition,
    status: l.status,
    viewCount: l.viewCount,
    inquiryCount: l.inquiryCount,
    isFeatured: l.isFeatured,
    adminCertified: l.adminCertified,
    createdAt: l.createdAt.toISOString(),
  }));
}
