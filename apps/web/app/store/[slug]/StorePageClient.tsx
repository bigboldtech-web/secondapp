"use client";

import { useState } from "react";
import Link from "next/link";
import { VendorProfile } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";

const CERT_LABELS: Record<string, { label: string; icon: string }> = {
  premium: { label: "Premium Seller", icon: "♛" },
  trusted: { label: "Trusted Seller", icon: "★" },
  verified: { label: "Verified Seller", icon: "✓" },
  unverified: { label: "New Seller", icon: "" },
};

interface StorePageClientProps {
  vendor: VendorProfile;
}

export default function StorePageClient({ vendor }: StorePageClientProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "videos" | "reviews" | "about">("listings");
  const cert = CERT_LABELS[vendor.certificationLevel] || CERT_LABELS.unverified;
  const videoListings = vendor.listings.filter((l) => l.videoUrl);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
        </div>
      </header>

      {/* Store banner — prefer vendor banner, else auto-loop the top video,
          else a soft gradient fallback. */}
      <div className="bg-input h-32 sm:h-44 relative overflow-hidden">
        {vendor.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vendor.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : vendor.featuredVideoUrl ? (
          <video
            src={vendor.featuredVideoUrl}
            poster={vendor.featuredVideoPoster ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6">
        {/* Store info */}
        <div className="relative -mt-8 mb-5">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-xl font-bold text-text-muted overflow-hidden">
              {vendor.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vendor.logoUrl} alt={`${vendor.storeName} logo`} className="w-full h-full object-cover" />
              ) : (
                vendor.storeName.charAt(0)
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-text-primary">{vendor.storeName}</h1>
                {cert.icon && (
                  <span className="text-coral text-sm font-semibold">{cert.icon} {cert.label}</span>
                )}
              </div>
              <p className="text-[12px] text-text-muted">
                {vendor.locationCity || "India"} · Member since {new Date(vendor.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Listings", value: vendor.totalListings.toString() },
            { label: "Sales", value: vendor.totalSales.toString() },
            { label: "Rating", value: `${vendor.ratingAvg.toFixed(1)} ★` },
            { label: "Reviews", value: vendor.ratingCount.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg px-3 py-2.5 text-center">
              <p className="text-sm sm:text-base font-bold text-text-primary">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-4 overflow-x-auto">
          {(["listings", "videos", "reviews", "about"] as const).map((tab) => {
            const count =
              tab === "listings"
                ? vendor.listings.length
                : tab === "videos"
                  ? videoListings.length
                  : tab === "reviews"
                    ? vendor.reviews.length
                    : null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px cursor-pointer bg-transparent capitalize shrink-0 ${
                  activeTab === tab
                    ? "border-coral text-coral"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab}
                {count !== null ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "listings" && (
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 pb-8">
            {vendor.listings.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
            {vendor.listings.length === 0 && (
              <p className="col-span-full text-center py-8 text-text-muted text-sm">No active listings</p>
            )}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {videoListings.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-[10px] overflow-hidden">
                <video
                  src={item.videoUrl ?? undefined}
                  controls
                  preload="metadata"
                  playsInline
                  poster={item.thumbnail ?? undefined}
                  className="w-full aspect-video bg-black object-cover"
                />
                <div className="px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-text-primary truncate">{item.title}</p>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-[13px] font-bold text-coral">
                      ₹{Math.round(item.price / 100).toLocaleString("en-IN")}
                    </span>
                    <Link
                      href={`/listing/${item.id}`}
                      className="text-[11px] text-text-muted hover:text-text-primary no-underline"
                    >
                      View listing →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {videoListings.length === 0 && (
              <p className="col-span-full text-center py-8 text-text-muted text-sm">
                No videos yet. Vendors are encouraged to upload a short video with every listing.
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3 pb-8">
            {vendor.reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-[10px] px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{review.buyerName}</span>
                    <span className="text-xs text-coral font-semibold">{"★".repeat(review.rating)}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{formatTimeAgo(review.createdAt)}</span>
                </div>
                {review.comment && <p className="text-[13px] text-text-secondary">{review.comment}</p>}
              </div>
            ))}
            {vendor.reviews.length === 0 && (
              <p className="text-center py-8 text-text-muted text-sm">No reviews yet</p>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-card border border-border rounded-[10px] px-5 py-4 mb-8">
            <h2 className="text-sm font-bold text-text-primary mb-2">About {vendor.storeName}</h2>
            {vendor.bio && <p className="text-[13px] text-text-secondary leading-relaxed mb-3">{vendor.bio}</p>}
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <span className="text-text-muted">Location</span>
                <p className="text-text-primary font-medium">{vendor.locationCity || "India"}</p>
              </div>
              <div>
                <span className="text-text-muted">Verification</span>
                <p className="text-text-primary font-medium">{cert.label}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
