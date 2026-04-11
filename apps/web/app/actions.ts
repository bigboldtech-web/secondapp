"use server";

import { prisma } from "@second-app/database";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

// ============================================================
// DEAL ALERTS
// ============================================================

export async function createAlert(data: {
  productSlug: string;
  maxPrice?: number;
  condition?: string;
  specs?: Record<string, string>;
}) {
  const session = await getSession();
  if (!session) return { error: "Please log in first" };

  const product = await prisma.product.findUnique({ where: { slug: data.productSlug } });
  if (!product) return { error: "Product not found" };

  const alert = await prisma.alert.create({
    data: {
      userId: session.userId,
      productId: product.id,
      maxPrice: data.maxPrice ? data.maxPrice * 100 : null,
      conditionMin: data.condition || null,
      filters: data.specs ? JSON.stringify(data.specs) : null,
    },
  });

  revalidatePath("/alerts");
  return { success: true, alertId: alert.id };
}

export async function deleteAlert(alertId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    select: { userId: true },
  });
  if (!alert || alert.userId !== session.userId) return { error: "Alert not found" };

  await prisma.alert.delete({ where: { id: alertId } });
  revalidatePath("/alerts");
  return { success: true };
}

export async function getMyAlerts() {
  const session = await getSession();
  if (!session) return [];

  const alerts = await prisma.alert.findMany({
    where: { userId: session.userId, isActive: true },
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
  const session = await getSession();
  if (!session) return { error: "Please log in first" };

  let wishlist = await prisma.collection.findFirst({
    where: { userId: session.userId, name: "Saved Items" },
  });

  if (!wishlist) {
    wishlist = await prisma.collection.create({
      data: { userId: session.userId, name: "Saved Items", isPublic: false },
    });
  }

  const existing = await prisma.collectionItem.findFirst({
    where: { collectionId: wishlist.id, listingId },
  });

  if (existing) {
    await prisma.collectionItem.delete({ where: { id: existing.id } });
    revalidatePath("/saved");
    return { saved: false };
  } else {
    await prisma.collectionItem.create({
      data: { collectionId: wishlist.id, listingId },
    });
    revalidatePath("/saved");
    return { saved: true };
  }
}

export async function getMySavedListings() {
  const session = await getSession();
  if (!session) return [];

  const wishlist = await prisma.collection.findFirst({
    where: { userId: session.userId, name: "Saved Items" },
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

// Every mutation below runs through requireOwnedListing() so a vendor can
// only act on their own inventory. Previously these were open by listingId
// — anyone logged in could pause or delete any listing on the platform.
type OwnedListingResult =
  | { ok: false; error: string }
  | { ok: true; vendor: { id: string }; listingId: string };

async function requireOwnedListing(listingId: string): Promise<OwnedListingResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { ok: false, error: "Vendor account required" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, vendorId: true },
  });
  if (!listing) return { ok: false, error: "Listing not found" };
  if (listing.vendorId !== vendor.id) return { ok: false, error: "Not your listing" };

  return { ok: true, vendor: { id: vendor.id }, listingId: listing.id };
}

const ALLOWED_STATUSES = new Set(["active", "expired", "sold", "draft"]);

export async function updateListingStatus(listingId: string, status: string) {
  const owned = await requireOwnedListing(listingId);
  if (!owned.ok) return owned;
  if (!ALLOWED_STATUSES.has(status)) return { error: "Invalid status" };

  await prisma.listing.update({ where: { id: owned.listingId }, data: { status } });
  revalidatePath("/vendor/listings/manage");
  return { success: true };
}

export async function deleteListing(listingId: string) {
  const owned = await requireOwnedListing(listingId);
  if (!owned.ok) return owned;

  await prisma.listing.delete({ where: { id: owned.listingId } });
  await prisma.vendor.update({
    where: { id: owned.vendor.id },
    data: { totalListings: { decrement: 1 } },
  });
  revalidatePath("/vendor/listings/manage");
  return { success: true };
}

interface UpdateListingInput {
  price: number;              // rupees
  originalPrice: number | null;
  condition: string;
  description: string | null;
  specs: Record<string, string>;
  photos: string[];
  videoUrl: string | null;
}

export async function updateListing(listingId: string, input: UpdateListingInput) {
  const owned = await requireOwnedListing(listingId);
  if (!owned.ok) return owned;

  if (!input.price || input.price <= 0) return { error: "Invalid price" };
  if (!input.condition) return { error: "Condition is required" };
  if (input.description && input.description.length > 1000) {
    return { error: "Description must be under 1000 characters" };
  }

  await prisma.listing.update({
    where: { id: owned.listingId },
    data: {
      price: Math.round(input.price * 100),
      originalPrice: input.originalPrice ? Math.round(input.originalPrice * 100) : null,
      condition: input.condition,
      description: input.description || null,
      specs: JSON.stringify(input.specs ?? {}),
      photos: input.photos && input.photos.length > 0 ? JSON.stringify(input.photos) : null,
      videoUrl: input.videoUrl || null,
    },
  });

  revalidatePath("/vendor/listings/manage");
  revalidatePath(`/listing/${owned.listingId}`);

  return { success: true };
}

export interface EditableListingPayload {
  id: string;
  productName: string;
  brandName: string;
  modelName: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  conditions: string[];
  description: string | null;
  specs: Record<string, string>;
  photos: string[];
  videoUrl: string | null;
  status: string;
}

export async function getListingForEdit(
  listingId: string
): Promise<{ error: string } | EditableListingPayload> {
  const owned = await requireOwnedListing(listingId);
  if (!owned.ok) return { error: owned.error };

  const listing = await prisma.listing.findUnique({
    where: { id: owned.listingId },
    include: {
      product: {
        include: {
          category: { select: { name: true, conditionScale: true } },
          brand: { select: { name: true } },
          model: { select: { name: true } },
        },
      },
    },
  });
  if (!listing) return { error: "Listing not found" as const };

  const conditions: string[] = listing.product.category.conditionScale
    ? (() => { try { return JSON.parse(listing.product.category.conditionScale!); } catch { return []; } })()
    : [];

  const specs: Record<string, string> = listing.specs
    ? (() => { try { return JSON.parse(listing.specs); } catch { return {}; } })()
    : {};

  const photos: string[] = listing.photos
    ? (() => { try { const p = JSON.parse(listing.photos); return Array.isArray(p) ? p : []; } catch { return []; } })()
    : [];

  return {
    id: listing.id,
    productName: listing.product.displayName,
    brandName: listing.product.brand.name,
    modelName: listing.product.model.name,
    categoryName: listing.product.category.name,
    price: listing.price / 100,
    originalPrice: listing.originalPrice ? listing.originalPrice / 100 : null,
    condition: listing.condition,
    conditions,
    description: listing.description,
    specs,
    photos,
    videoUrl: listing.videoUrl,
    status: listing.status,
  };
}

export async function getVendorListings() {
  const session = await getSession();
  if (!session) return [];

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
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
