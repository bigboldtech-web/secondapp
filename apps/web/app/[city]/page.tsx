import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@second-app/database";
import { CITIES, CATEGORY_ICONS } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import { breadcrumbJsonLd } from "@/lib/seo";

const CITY_SLUGS: Record<string, string> = {};
for (const city of CITIES) {
  if (city === "All India") continue;
  CITY_SLUGS[city.toLowerCase().replace(/\s+/g, "-")] = city;
}

function resolveCity(slug: string): string | null {
  return CITY_SLUGS[slug] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cityName = resolveCity(citySlug);
  if (!cityName) return {};

  const title = `Buy Certified Pre-Owned Products in ${cityName} — Second App`;
  const description = `Browse second-hand phones, laptops, cars, and more from verified dealers in ${cityName}. All products come with escrow payment protection.`;

  return { title, description, openGraph: { title, description } };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const cityName = resolveCity(citySlug);
  if (!cityName) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        select: { id: true },
        where: {
          listings: { some: { status: "active", vendor: { locationCity: cityName } } },
        },
      },
    },
  });

  const withCounts = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c.products.length,
  }));

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: cityName },
          ])),
        }}
      />
      <SiteHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: cityName }]} />

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Second-hand in {cityName}
        </h1>
        <p className="text-[13px] text-text-muted mb-6">
          Browse certified pre-owned products from verified dealers in {cityName}.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {withCounts.map((cat) => {
            const iconPath = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.phones;
            return (
              <Link
                key={cat.id}
                href={`/${citySlug}/${cat.slug}`}
                className="bg-card border border-border rounded-[10px] px-4 py-5 no-underline hover:shadow-sm transition-shadow text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-input flex items-center justify-center mx-auto mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#bbb"><path d={iconPath} /></svg>
                </div>
                <p className="text-[14px] font-semibold text-text-primary">{cat.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{cat.count} listing{cat.count !== 1 ? "s" : ""}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
