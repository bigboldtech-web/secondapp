"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CreateListingInput {
  categoryId: string;
  brandId: string;
  modelId: string;
  specs: Record<string, string>;
  condition: string;
  price: number; // in rupees
  originalPrice?: number;
  description?: string;
  photos?: string[];
  videoUrl?: string;
}

export async function createListing(input: CreateListingInput) {
  const session = await getSession();
  if (!session) return { error: "Please log in first" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { error: "You must register as a vendor before posting listings" };

  if (!input.price || input.price <= 0) return { error: "Please enter a valid price" };
  if (!input.condition) return { error: "Please select a condition" };

  const model = await prisma.model.findUnique({
    where: { id: input.modelId },
    include: { brand: true },
  });
  if (!model) return { error: "Model not found" };
  if (model.brandId !== input.brandId) return { error: "Model does not belong to the selected brand" };

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

  // Trusted and premium vendors skip moderation.
  const autoApprove = vendor.certificationLevel === "trusted" || vendor.certificationLevel === "premium";

  const listing = await prisma.listing.create({
    data: {
      productId: product.id,
      vendorId: vendor.id,
      specs: JSON.stringify(input.specs),
      condition: input.condition,
      price: Math.round(input.price * 100),
      originalPrice: input.originalPrice ? Math.round(input.originalPrice * 100) : null,
      description: input.description || null,
      photos: input.photos && input.photos.length > 0 ? JSON.stringify(input.photos) : null,
      videoUrl: input.videoUrl || null,
      status: autoApprove ? "active" : "pending",
    },
  });

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { totalListings: { increment: 1 } },
  });

  revalidatePath("/vendor/listings/manage");
  revalidatePath("/vendor/dashboard");

  return { success: true, listingId: listing.id, autoApproved: autoApprove };
}
