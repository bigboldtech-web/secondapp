"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { boostListing, cancelBoost } from "./actions";

interface BoostFormProps {
  listing: {
    id: string;
    productName: string;
    isPromoted: boolean;
    promotedUntil: string | null;
    isFeatured: boolean;
  };
}

const PLANS = [
  { days: 7, price: 99, label: "7 days", popular: false },
  { days: 14, price: 179, label: "14 days", popular: true },
  { days: 30, price: 299, label: "30 days", popular: false },
];

export default function BoostForm({ listing }: BoostFormProps) {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const isActive = listing.isPromoted && listing.promotedUntil && new Date(listing.promotedUntil) > new Date();
  const daysLeft = isActive && listing.promotedUntil
    ? Math.ceil((new Date(listing.promotedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleBoost = async () => {
    setSubmitting(true);
    setMessage(null);
    const res = await boostListing(listing.id, selectedDays);
    setSubmitting(false);
    if ("error" in res && res.error) {
      setMessage({ kind: "err", text: res.error });
      return;
    }
    setMessage({ kind: "ok", text: `Boosted for ${selectedDays} days! Your listing will appear at the top.` });
    router.refresh();
  };

  const handleCancel = async () => {
    setSubmitting(true);
    const res = await cancelBoost(listing.id);
    setSubmitting(false);
    if ("error" in res && res.error) {
      setMessage({ kind: "err", text: res.error });
      return;
    }
    setMessage({ kind: "ok", text: "Boost cancelled." });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[600px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/listings/manage" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Boost listing</span>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 sm:px-6 py-6">
        <div className="bg-card border border-border rounded-[10px] px-5 py-5">
          <h1 className="text-lg font-bold text-text-primary mb-1">{listing.productName}</h1>

          {isActive ? (
            <div className="mb-5">
              <div className="bg-coral-light border border-coral-border rounded-lg px-4 py-3 mb-3">
                <p className="text-[13px] font-semibold text-coral">Currently boosted</p>
                <p className="text-[12px] text-text-secondary">{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</p>
              </div>
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="text-[12px] px-3 py-1.5 rounded-md border border-border bg-white text-text-muted cursor-pointer"
              >
                Cancel boost
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-text-muted mb-4">
                Boosted listings appear at the top of category and search results with an &quot;AD&quot; badge. Pay once, run for the full duration.
              </p>

              <div className="space-y-2 mb-5">
                {PLANS.map((plan) => (
                  <button
                    key={plan.days}
                    onClick={() => setSelectedDays(plan.days)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer ${
                      selectedDays === plan.days
                        ? "border-coral-border bg-coral-light"
                        : "border-border bg-white hover:bg-bg"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[14px] font-semibold ${selectedDays === plan.days ? "text-coral" : "text-text-primary"}`}>
                        {plan.label}
                      </span>
                      {plan.popular && (
                        <span className="text-[9px] font-bold bg-coral text-white px-1.5 py-0.5 rounded">POPULAR</span>
                      )}
                    </div>
                    <span className="text-[14px] font-bold text-text-primary">₹{plan.price}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleBoost}
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-coral text-white text-[14px] font-semibold border-none cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Processing…" : `Boost for ₹${PLANS.find((p) => p.days === selectedDays)!.price}`}
              </button>
            </>
          )}

          {message && (
            <div className={`mt-4 px-3 py-2 text-[12px] font-medium rounded-lg ${
              message.kind === "ok" ? "bg-condition-likenew-bg text-condition-likenew-text"
                : "bg-condition-rough-bg text-condition-rough-text"
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
