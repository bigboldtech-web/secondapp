import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@second-app/database";
import { getListings } from "@/lib/db";
import CategoryPageClient from "./CategoryPageClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true } });
  if (!category) return {};

  const title = `Buy Used ${category.name} — Certified Pre-Owned ${category.name} | Second App`;
  const description = `Browse certified pre-owned ${category.name.toLowerCase()} from verified dealers across India. Compare prices, check conditions, and buy with escrow protection on Second App.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `https://gosecond.in/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!category) notFound();

  const listings = await getListings({ categorySlug: slug, limit: 100 });

  return <CategoryPageClient category={category} listings={listings} />;
}
