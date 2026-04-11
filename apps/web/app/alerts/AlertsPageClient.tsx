"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAlert } from "@/app/actions";

interface Alert {
  id: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  brandName: string;
  maxPrice: number | null;
  conditionMin: string | null;
  activeListings: number;
  createdAt: string;
}

export default function AlertsPageClient({ alerts }: { alerts: Alert[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteAlert(id);
    router.refresh();
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">My Deal Alerts</span>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Deal Alerts</h1>
            <p className="text-[13px] text-text-muted">Get notified when new listings match your criteria</p>
          </div>
          <span className="text-[12px] text-text-faint">{alerts.length} active</span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-card border border-border rounded-[10px] px-4 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/product/${alert.productSlug}`} className="text-[14px] font-semibold text-text-primary no-underline hover:text-coral">
                    {alert.productName}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                    <span>{alert.categoryName}</span>
                    <span>·</span>
                    <span>{alert.brandName}</span>
                    {alert.maxPrice && (
                      <>
                        <span>·</span>
                        <span>Max ₹{alert.maxPrice.toLocaleString("en-IN")}</span>
                      </>
                    )}
                    {alert.conditionMin && (
                      <>
                        <span>·</span>
                        <span>{alert.conditionMin}+</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-coral font-medium mt-1">
                    {alert.activeListings} listing{alert.activeListings !== 1 ? "s" : ""} available now
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/product/${alert.productSlug}`}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-coral text-white font-semibold no-underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    disabled={deleting === alert.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-muted font-medium cursor-pointer disabled:opacity-50"
                  >
                    {deleting === alert.id ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-coral-light flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8553D" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-text-primary mb-1">No alerts yet</h2>
            <p className="text-[13px] text-text-muted mb-4">
              Set alerts on product pages to get notified when new deals appear
            </p>
            <Link href="/" className="inline-block px-5 py-2 rounded-lg bg-coral text-white text-sm font-semibold no-underline">
              Browse Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
