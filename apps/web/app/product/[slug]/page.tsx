import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/db";
import ProductPageClient from "./ProductPageClient";
import { productGroupJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const prices = product.listings.map((l) => l.price);
  const minPrice = prices.length ? Math.round(Math.min(...prices) / 100) : 0;
  const maxPrice = prices.length ? Math.round(Math.max(...prices) / 100) : 0;

  const title = `Buy Used ${product.displayName} — ₹${minPrice.toLocaleString("en-IN")} to ₹${maxPrice.toLocaleString("en-IN")} | Second App`;
  const description = `Compare ${product.listings.length} certified pre-owned ${product.displayName} listings from verified dealers. ${product.brandName} ${product.modelName} starting at ₹${minPrice.toLocaleString("en-IN")}. Buy with escrow protection on Second App.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `https://gosecond.in/product/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const pageUrl = `https://gosecond.in/product/${slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productGroupJsonLd(product, pageUrl)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: product.categoryName, url: `/category/${product.categorySlug}` },
            { name: product.displayName },
          ])),
        }}
      />
      <ProductPageClient product={product} />
    </>
  );
}
