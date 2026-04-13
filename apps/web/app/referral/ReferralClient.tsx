"use client";

import { useState } from "react";
import Link from "next/link";

interface ReferralProps {
  code: string;
  credits: number;
  referrals: { id: string; friendName: string; amount: number; status: string; date: string }[];
}

export default function ReferralClient({ code, credits, referrals }: ReferralProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : `/register?ref=${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  };

  const handleShare = async () => {
    if ("share" in navigator) {
      try {
        await navigator.share({ title: "Join Second App", text: `Use my code ${code} and we both get ₹100!`, url: shareUrl });
        return;
      } catch { /* cancelled */ }
    }
    handleCopy();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[600px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/profile" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Invite friends</span>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 sm:px-6 py-6">
        <div className="bg-card border border-border rounded-[12px] px-5 py-6 text-center mb-5">
          <h1 className="text-xl font-bold text-text-primary mb-1">Invite friends, earn ₹100</h1>
          <p className="text-[13px] text-text-muted mb-5">
            Share your code. When they sign up and make their first purchase, you both get ₹100 credit.
          </p>

          <div className="bg-input-light border border-border rounded-lg px-4 py-3 mb-4">
            <p className="text-[10px] text-text-muted mb-1">Your referral code</p>
            <p className="text-2xl font-extrabold tracking-widest text-coral">{code}</p>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-lg bg-coral text-white text-[13px] font-semibold border-none cursor-pointer"
            >
              Share invite link
            </button>
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-lg border border-border bg-white text-text-primary text-[13px] font-semibold cursor-pointer"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[10px] px-4 py-3 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-text-muted">Your credits</span>
            <span className="text-[16px] font-bold text-coral">₹{(credits / 100).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {referrals.length > 0 && (
          <div className="bg-card border border-border rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-text-primary">Your referrals ({referrals.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {referrals.map((r) => (
                <div key={r.id} className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{r.friendName}</p>
                    <p className="text-[10px] text-text-muted">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[12px] font-semibold text-condition-likenew-text">
                    +₹{(r.amount / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
