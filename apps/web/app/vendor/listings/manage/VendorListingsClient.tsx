"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateListingStatus } from "@/app/actions";

interface VendorListing {
  id: string;
  productName: string;
  productSlug: string;
  price: number;
  condition: string;
  status: string;
  viewCount: number;
  inquiryCount: number;
  isFeatured: boolean;
  adminCertified: boolean;
  createdAt: string;
}

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

const STATUS_STYLES: Record<string, string> = {
  active: "bg-condition-likenew-bg text-condition-likenew-text",
  pending: "bg-condition-good-bg text-condition-good-text",
  sold: "bg-condition-excellent-bg text-condition-excellent-text",
  expired: "bg-input text-text-muted",
  draft: "bg-input text-text-muted",
  rejected: "bg-condition-rough-bg text-condition-rough-text",
};

export default function VendorListingsClient({ listings }: { listings: VendorListing[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = filter === "all" ? listings : listings.filter((l) => l.status === filter);

  const statusCounts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    pending: listings.filter((l) => l.status === "pending").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  const handleAction = async (id: string, status: string) => {
    setActionLoading(id);
    await updateListingStatus(id, status);
    router.refresh();
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
              Second <span className="text-coral">App</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <span className="text-[12px] font-medium text-text-muted">Manage Listings</span>
          </div>
          <Link href="/vendor/listings/new" className="px-3.5 py-1.5 rounded-md bg-coral text-white text-xs font-semibold no-underline">
            + New Listing
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(["all", "active", "pending", "sold"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium cursor-pointer border capitalize ${
                filter === f
                  ? "bg-coral text-white border-coral"
                  : "bg-white text-text-secondary border-border hover:bg-bg"
              }`}
            >
              {f === "all" ? "All" : f} ({statusCounts[f] || 0})
            </button>
          ))}
        </div>

        {/* Listings */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((listing) => (
              <div key={listing.id} className="bg-card border border-border rounded-[10px] px-4 py-3.5 flex items-center gap-4">
                {/* Product icon */}
                <div className="w-14 h-14 bg-input rounded-lg flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ccc">
                    <path d="M15.5 1h-8A2.5 2.5 0 005 3.5v17A2.5 2.5 0 007.5 23h8a2.5 2.5 0 002.5-2.5v-17A2.5 2.5 0 0015.5 1zm-4 21a1 1 0 110-2 1 1 0 010 2zm4.5-4H7V4h9v14z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/product/${listing.productSlug}`} className="text-[14px] font-semibold text-text-primary no-underline hover:text-coral truncate">
                      {listing.productName}
                    </Link>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize ${STATUS_STYLES[listing.status] || STATUS_STYLES.draft}`}>
                      {listing.status}
                    </span>
                    {listing.adminCertified && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-coral text-white">CERTIFIED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span className="font-bold text-text-primary text-[13px]">{formatPrice(listing.price)}</span>
                    <span>{listing.condition}</span>
                    <span>{listing.viewCount} views</span>
                    <span>{listing.inquiryCount} inquiries</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                  <Link
                    href={`/vendor/listings/${listing.id}/edit`}
                    className="text-[10px] px-2.5 py-1.5 rounded-md bg-white border border-border text-text-primary font-semibold no-underline"
                  >
                    Edit
                  </Link>
                  {listing.status === "active" && (
                    <>
                      <button
                        onClick={() => handleAction(listing.id, "sold")}
                        disabled={actionLoading === listing.id}
                        className="text-[10px] px-2.5 py-1.5 rounded-md bg-condition-likenew-bg text-condition-likenew-text font-semibold border-none cursor-pointer"
                      >
                        Mark Sold
                      </button>
                      <button
                        onClick={() => handleAction(listing.id, "expired")}
                        disabled={actionLoading === listing.id}
                        className="text-[10px] px-2.5 py-1.5 rounded-md bg-input text-text-muted font-semibold border-none cursor-pointer"
                      >
                        Pause
                      </button>
                    </>
                  )}
                  {listing.status === "expired" && (
                    <button
                      onClick={() => handleAction(listing.id, "active")}
                      disabled={actionLoading === listing.id}
                      className="text-[10px] px-2.5 py-1.5 rounded-md bg-condition-excellent-bg text-condition-excellent-text font-semibold border-none cursor-pointer"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm font-semibold text-text-secondary mb-1">No {filter === "all" ? "" : filter} listings</p>
            <Link href="/vendor/listings/new" className="text-[12px] text-coral font-semibold no-underline mt-2 inline-block">
              + Create a listing
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
