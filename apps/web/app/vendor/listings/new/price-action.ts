"use server";

import { prisma } from "@second-app/database";

export async function getPriceSuggestion(modelId: string, condition: string) {
  const products = await prisma.product.findMany({
    where: { modelId },
    select: { id: true },
  });

  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) return null;

  const listings = await prisma.listing.findMany({
    where: {
      productId: { in: productIds },
      status: "active",
      condition,
    },
    select: { price: true },
    orderBy: { price: "asc" },
  });

  if (listings.length === 0) {
    const allListings = await prisma.listing.findMany({
      where: {
        productId: { in: productIds },
        status: "active",
      },
      select: { price: true },
      orderBy: { price: "asc" },
    });

    if (allListings.length === 0) return null;

    const prices = allListings.map((l) => l.price / 100);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      count: prices.length,
      sameCondition: false,
    };
  }

  const prices = listings.map((l) => l.price / 100);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    count: prices.length,
    sameCondition: true,
  };
}
