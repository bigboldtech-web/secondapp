"use server";

import { prisma } from "@second-app/database";

interface CreateListingInput {
  categoryId: string;
  brandId: string;
  modelId: string;
  specs: Record<string, string>;
  condition: string;
  price: number; // in rupees
  originalPrice?: number;
  description?: string;
}

export async function createListing(input: CreateListingInput) {
  // Find or create the product for this category+brand+model combo
  const model = await prisma.model.findUnique({
    where: { id: input.modelId },
    include: { brand: true },
  });

  if (!model) {
    return { error: "Model not found" };
  }

  // Find existing product or create one
  let product = await prisma.product.findFirst({
    where: {
      categoryId: input.categoryId,
      brandId: input.brandId,
      modelId: input.modelId,
    },
  });

  if (!product) {
    const slug = `${model.brand.slug}-${model.slug}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    product = await prisma.product.create({
      data: {
        categoryId: input.categoryId,
        brandId: input.brandId,
        modelId: input.modelId,
        slug,
        displayName: model.name,
      },
    });
  }

  // For MVP, use the first vendor (in production, this would come from the authenticated user session)
  const vendor = await prisma.vendor.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!vendor) {
    return { error: "No vendor found. Please register as a vendor first." };
  }

  const listing = await prisma.listing.create({
    data: {
      productId: product.id,
      vendorId: vendor.id,
      specs: JSON.stringify(input.specs),
      condition: input.condition,
      price: input.price * 100, // Convert to paise
      originalPrice: input.originalPrice ? input.originalPrice * 100 : null,
      description: input.description || null,
      status: "pending", // Goes to moderation queue
    },
  });

  return { success: true, listingId: listing.id };
}
