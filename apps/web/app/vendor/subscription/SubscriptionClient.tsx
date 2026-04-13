"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upgradePlan, PLANS } from "./actions";

interface SubscriptionClientProps {
  current: {
    plan: string;
    endsAt: string | null;
    maxListings: number;
    totalListings: number;
  };
}

const PLAN_ORDER = ["free", "pro", "business"] as const;

const FEATURES: Record<string, string[]> = {
  free: ["10 active listings", "Basic analytics", "Standard support"],
  pro: ["Unlimited listings", "Advanced analytics", "Priority support", "Bulk upload (coming soon)"],
  business: ["Everything in Pro", "API access (coming soon)", "Dedicated account manager", "Custom store branding"],
};

export default function SubscriptionClient({ current }: SubscriptionClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const isActive = current.endsAt && new Date(current.endsAt) > new Date();
  const daysLeft = isActive ? Math.ceil((new Date(current.endsAt!).getTime() - Date.now()) / 86400000) : null;

  const handleUpgrade = async (plan: string) => {
    setSubmitting(plan);
    setMessage(null);
    const res = await upgradePlan(plan);
    setSubmitting(null);
    if ("error" in res && res.error) {
      setMessage({ kind: "err", text: res.error });
      return;
    }
    setMessage({ kind: "ok", text: plan === "free" ? "Downgraded to Free." : `Upgraded to ${PLANS[plan].label}!` });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Subscription</span>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-text-primary mb-1">Choose your plan</h1>
        <p className="text-[13px] text-text-muted mb-6">
          Currently on <span className="font-semibold text-coral">{PLANS[current.plan]?.label ?? current.plan}</span>
          {daysLeft !== null && ` · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
          {` · ${current.totalListings} / ${current.maxListings === 999 ? "∞" : current.maxListings} listings used`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLAN_ORDER.map((plan) => {
            const config = PLANS[plan];
            const isCurrent = current.plan === plan;
            return (
              <div
                key={plan}
                className={`bg-card border rounded-[12px] px-5 py-5 flex flex-col ${
                  plan === "pro" ? "border-coral ring-1 ring-coral/20" : "border-border"
                }`}
              >
                {plan === "pro" && (
                  <span className="text-[9px] font-bold bg-coral text-white px-2 py-0.5 rounded self-start mb-2">
                    POPULAR
                  </span>
                )}
                <h2 className="text-lg font-bold text-text-primary">{config.label}</h2>
                <p className="text-2xl font-extrabold text-text-primary mt-1">
                  {config.price === 0 ? "Free" : `₹${config.price.toLocaleString("en-IN")}`}
                  {config.price > 0 && <span className="text-[13px] font-normal text-text-muted">/month</span>}
                </p>

                <ul className="mt-4 space-y-2 flex-1">
                  {FEATURES[plan].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-text-secondary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" className="shrink-0 mt-0.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent || submitting !== null}
                  className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer disabled:opacity-50 ${
                    isCurrent
                      ? "bg-input text-text-muted cursor-default"
                      : plan === "pro"
                        ? "bg-coral text-white"
                        : "bg-white border border-border text-text-primary"
                  }`}
                >
                  {submitting === plan ? "Processing…" : isCurrent ? "Current plan" : config.price === 0 ? "Downgrade" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>

        {message && (
          <div className={`mt-4 px-3 py-2 text-[12px] font-medium rounded-lg ${
            message.kind === "ok" ? "bg-condition-likenew-bg text-condition-likenew-text"
              : "bg-condition-rough-bg text-condition-rough-text"
          }`}>
            {message.text}
          </div>
        )}
      </main>
    </div>
  );
}
