import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@second-app/database";
import { getListings, getCategoriesWithCounts } from "@/lib/db";
import { CITIES } from "@/lib/types";
import CategoryPageClient from "@/app/category/[slug]/CategoryPageClient";
import { breadcrumbJsonLd } from "@/lib/seo";

const CITY_SLUGS: Record<string, string> = {};
for (const city of CITIES) {
  if (city === "All India") continue;
  CITY_SLUGS[city.toLowerCase().replace(/\s+/g, "-")] = city;
}

function resolveCity(slug: string): string | null {
  return CITY_SLUGS[slug] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string }> }): Promise<Metadata> {
  const { city: citySlug, category: catSlug } = await params;
  const cityName = resolveCity(citySlug);
  if (!cityName) return {};

  const category = await prisma.category.findUnique({ where: { slug: catSlug }, select: { name: true } });
  if (!category) return {};

  const title = `Buy Used ${category.name} in ${cityName} — Second App`;
  const description = `Browse certified pre-owned ${category.name.toLowerCase()} from verified dealers in ${cityName}. Compare prices, conditions, and buy with escrow protection on Second App.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `https://gosecond.in/${citySlug}/${catSlug}` },
  };
}

export default async function CityCategory({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city: citySlug, category: catSlug } = await params;
  const cityName = resolveCity(citySlug);
  if (!cityName) notFound();

  const category = await prisma.category.findUnique({ where: { slug: catSlug }, select: { id: true, name: true, slug: true } });
  if (!category) notFound();

  const listings = await getListings({ categorySlug: catSlug, city: cityName, limit: 100 });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: cityName, url: `/${citySlug}` },
            { name: category.name },
          ])),
        }}
      />
      <CategoryPageClient
        category={{ ...category, name: `${category.name} in ${cityName}` }}
        listings={listings}
      />
    </>
  );
}
