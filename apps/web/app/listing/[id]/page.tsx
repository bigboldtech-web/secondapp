import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@second-app/database";
import { getListingById, getSimilarListings } from "@/lib/db";
import { formatPrice, formatTimeAgo, calcDiscount } from "@/lib/utils";
import { CONDITION_COLORS, CATEGORY_ICONS } from "@/lib/types";
import SimilarListings from "./SimilarListings";
import AskQuestionButton from "./AskQuestionButton";
import ReportButton from "./ReportButton";
import { listingJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return {};

  const price = Math.round(listing.price / 100);
  const specs = Object.values(listing.specs).join(", ");
  const title = `${listing.product.displayName} ${specs} — ₹${price.toLocaleString("en-IN")} | ${listing.condition} | Second App`;
  const description = `Buy certified pre-owned ${listing.product.displayName} in ${listing.condition} condition for ₹${price.toLocaleString("en-IN")} from ${listing.vendor.storeName}. ${listing.description?.slice(0, 100) || "Verified dealer with escrow protection."}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `https://gosecond.in/listing/${id}` },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) notFound();

  // Fire-and-forget: view count + recently-viewed tracking.
  void prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Track recently viewed for logged-in users (upsert so re-visits just bump viewedAt).
  void (async () => {
    try {
      const { getSession } = await import("@/lib/auth");
      const session = await getSession();
      if (session) {
        await prisma.recentlyViewed.upsert({
          where: { userId_listingId: { userId: session.userId, listingId: id } },
          create: { userId: session.userId, listingId: id },
          update: { viewedAt: new Date() },
        });
        // Cap at 30 entries per user
        const old = await prisma.recentlyViewed.findMany({
          where: { userId: session.userId },
          orderBy: { viewedAt: "desc" },
          skip: 30,
          select: { id: true },
        });
        if (old.length > 0) {
          await prisma.recentlyViewed.deleteMany({
            where: { id: { in: old.map((r) => r.id) } },
          });
        }
      }
    } catch { /* never block render */ }
  })();

  const similar = await getSimilarListings(listing.product.slug, listing.id, 6);
  const condStyle = CONDITION_COLORS[listing.condition] || { bg: "bg-gray-100", text: "text-gray-700" };
  const discount = calcDiscount(listing.price, listing.originalPrice);
  const icon = CATEGORY_ICONS[listing.product.category.slug] || CATEGORY_ICONS.phones;

  const certLabels: Record<string, string> = {
    premium: "Premium Seller",
    trusted: "Trusted Seller",
    verified: "Verified Seller",
    unverified: "New Seller",
  };

  const pageUrl = `https://gosecond.in/listing/${id}`;

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(listing, pageUrl)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: listing.product.category.name, url: `/category/${listing.product.category.slug}` },
            { name: listing.product.displayName, url: `/product/${listing.product.slug}` },
            { name: `${listing.condition} — ₹${Math.round(listing.price / 100).toLocaleString("en-IN")}` },
          ])),
        }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <nav className="text-[12px] text-text-muted flex items-center gap-1 overflow-hidden">
            <Link href="/" className="hover:text-text-secondary no-underline text-text-muted shrink-0">Home</Link>
            <span className="shrink-0">/</span>
            <Link href={`/category/${listing.product.category.slug}`} className="hover:text-text-secondary no-underline text-text-muted shrink-0">{listing.product.category.name}</Link>
            <span className="shrink-0">/</span>
            <Link href={`/product/${listing.product.slug}`} className="hover:text-text-secondary no-underline text-text-muted shrink-0">{listing.product.displayName}</Link>
            <span className="shrink-0">/</span>
            <span className="text-text-primary font-medium truncate">Listing</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left column — Photos + Details */}
          <div>
            {/* Photo gallery */}
            <div className="bg-card border border-border rounded-[10px] overflow-hidden mb-4">
              <div className="aspect-[4/3] bg-input flex items-center justify-center relative">
                {listing.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.photos[0]} alt={listing.product.displayName} className="w-full h-full object-cover" />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#ccc"><path d={icon} /></svg>
                )}
                <span className={`absolute bottom-3 left-3 text-xs px-2 py-1 font-semibold rounded ${condStyle.bg} ${condStyle.text}`}>
                  {listing.condition}
                </span>
                {listing.adminCertified && (
                  <span className="absolute top-3 left-3 text-[10px] px-2 py-1 bg-coral text-white font-bold rounded">
                    CERTIFIED
                  </span>
                )}
                {listing.isFeatured && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-1 bg-text-primary text-white font-bold rounded">
                    FEATURED
                  </span>
                )}
              </div>
              {listing.photos.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto">
                  {listing.photos.slice(0, 6).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt={`Photo ${i + 1}`} className="w-16 h-16 object-cover rounded border border-border shrink-0" />
                  ))}
                </div>
              )}
            </div>

            {/* Specs table */}
            <div className="bg-card border border-border rounded-[10px] px-4 sm:px-5 py-4 mb-4">
              <h2 className="text-sm font-bold text-text-primary mb-3">Specifications</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(listing.specs).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] text-text-muted uppercase tracking-wide">{key}</span>
                    <span className="text-[13px] text-text-primary font-medium">{val}</span>
                  </div>
                ))}
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wide">Condition</span>
                  <span className="text-[13px] text-text-primary font-medium">{listing.condition}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wide">Category</span>
                  <span className="text-[13px] text-text-primary font-medium">{listing.product.category.name}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-card border border-border rounded-[10px] px-4 sm:px-5 py-4 mb-4">
                <h2 className="text-sm font-bold text-text-primary mb-2">Description</h2>
                <p className="text-[13px] text-text-secondary leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-[11px] text-text-muted px-1 mb-4">
              <span>{listing.viewCount} views</span>
              <span>{listing.inquiryCount} inquiries</span>
              <span>Listed {formatTimeAgo(listing.createdAt)}</span>
            </div>
            <ReportButton listingId={listing.id} />
          </div>

          {/* Right column — Price + Vendor */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-card border border-border rounded-[10px] px-5 py-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-text-primary">{formatPrice(listing.price)}</span>
                {listing.originalPrice && (
                  <span className="text-sm text-text-muted line-through">{formatPrice(listing.originalPrice)}</span>
                )}
              </div>
              {discount && (
                <span className="text-xs font-semibold text-condition-likenew-text bg-condition-likenew-bg px-2 py-0.5 rounded inline-block mb-3">
                  {discount}% off original price
                </span>
              )}
              <p className="text-sm font-medium text-text-primary mb-1">{listing.product.displayName}</p>
              <div className="flex gap-1 flex-wrap mb-4">
                {Object.values(listing.specs).map((val) => (
                  <span key={val} className="text-[10px] text-text-secondary bg-input-light px-1.5 py-0.5 rounded-[3px]">{val}</span>
                ))}
              </div>

              {/* FOMO indicator */}
              <div className="flex items-center gap-2 mb-3 text-[11px]">
                <span className="flex items-center gap-1 text-coral font-semibold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#E8553D" stroke="none"><circle cx="12" cy="12" r="5"/></svg>
                  {listing.viewCount > 100 ? `${Math.floor(listing.viewCount / 10)} people viewed today` : "Popular item"}
                </span>
              </div>

              <a href={`/checkout?listing=${listing.id}`} className="block w-full py-3 rounded-lg bg-coral text-white font-bold text-sm cursor-pointer border-none mb-2 hover:bg-[#d44a34] transition-colors text-center no-underline">
                Buy Now
              </a>
              <button className="w-full py-2.5 rounded-lg bg-white text-text-primary font-semibold text-sm cursor-pointer border border-border mb-3">
                Add to Cart
              </button>

              <div className="flex items-center gap-1.5 text-[10px] text-text-muted justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Buyer protection with escrow payment
              </div>
            </div>

            {/* Vendor card */}
            <Link href={`/store/${listing.vendor.storeSlug}`} className="block no-underline text-inherit">
              <div className="bg-card border border-border rounded-[10px] px-5 py-4 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-sm font-bold text-text-muted">
                    {listing.vendor.storeName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{listing.vendor.storeName}</p>
                    <p className="text-[11px] text-coral font-medium">
                      {certLabels[listing.vendor.certificationLevel] || "Seller"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{"★".repeat(Math.round(listing.vendor.ratingAvg))} {listing.vendor.ratingAvg.toFixed(1)}</p>
                    <p className="text-[10px] text-text-muted">{listing.vendor.ratingCount} reviews</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{listing.vendor.totalSales}</p>
                    <p className="text-[10px] text-text-muted">Sales</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{listing.vendor.locationCity || "India"}</p>
                    <p className="text-[10px] text-text-muted">Location</p>
                  </div>
                </div>

                <div className="text-[11px] text-coral font-medium text-center">
                  View Store →
                </div>
              </div>
            </Link>

            {/* Ask a question */}
            <AskQuestionButton listingId={listing.id} />

            {/* View all listings for this product */}
            <Link
              href={`/product/${listing.product.slug}`}
              className="block text-center text-[12px] text-coral font-semibold no-underline hover:underline"
            >
              See all {listing.product.displayName} listings →
            </Link>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <SimilarListings listings={similar} productName={listing.product.displayName} />
        )}
      </main>
    </div>
  );
}
