import { prisma } from "@second-app/database";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://gosecond.in";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/vendor/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const categories = await prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  const productPages: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const vendors = await prisma.vendor.findMany({ where: { kycStatus: "verified" }, select: { storeSlug: true, updatedAt: true } });
  const storePages: MetadataRoute.Sitemap = vendors.map((v) => ({
    url: `${baseUrl}/store/${v.storeSlug}`,
    lastModified: v.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const listings = await prisma.listing.findMany({ where: { status: "active" }, select: { id: true, updatedAt: true }, take: 1000 });
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${baseUrl}/listing/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...storePages, ...listingPages];
}
