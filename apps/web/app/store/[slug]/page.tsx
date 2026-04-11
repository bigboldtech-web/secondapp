import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVendorBySlug } from "@/lib/db";
import StorePageClient from "./StorePageClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return {};

  const title = `${vendor.storeName} — Certified ${vendor.certificationLevel} Seller | Second App`;
  const description = `${vendor.bio?.slice(0, 120) || `Shop ${vendor.totalListings} certified pre-owned products from ${vendor.storeName}.`} ${vendor.ratingAvg.toFixed(1)}★ rating, ${vendor.totalSales} sales. ${vendor.locationCity || "India"}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `https://gosecond.in/store/${slug}` },
  };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);

  if (!vendor) notFound();

  return <StorePageClient vendor={vendor} />;
}
