"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  url: string;
  listingId: string;
  userId?: string | null;
}

export default function ShareButton({ title, url, listingId, userId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getFullUrl = () => typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  const getAffiliateUrl = () => {
    if (!userId) return getFullUrl();
    return typeof window !== "undefined"
      ? `${window.location.origin}/api/affiliate/click?listing=${listingId}&ref=${userId}`
      : `/api/affiliate/click?listing=${listingId}&ref=${userId}`;
  };

  const copyAndClose = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", text);
    }
    setShowMenu(false);
  };

  const handleShare = async () => {
    if ("share" in navigator) {
      try {
        await navigator.share({ title, url: getFullUrl() });
        setShowMenu(false);
        return;
      } catch {}
    }
    await copyAndClose(getFullUrl());
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 text-[11px] text-text-muted border-none bg-transparent cursor-pointer hover:text-text-secondary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {copied ? "Link copied" : "Share"}
      </button>

      {showMenu && (
        <div className="absolute bottom-[calc(100%+6px)] left-0 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border overflow-hidden z-50 min-w-[180px]">
          <button
            onClick={handleShare}
            className="w-full px-3 py-2 text-left text-[12px] text-text-primary border-none bg-white hover:bg-bg cursor-pointer"
          >
            Share listing
          </button>
          <button
            onClick={() => copyAndClose(getFullUrl())}
            className="w-full px-3 py-2 text-left text-[12px] text-text-primary border-none bg-white hover:bg-bg cursor-pointer"
          >
            Copy link
          </button>
          {userId && (
            <button
              onClick={() => copyAndClose(getAffiliateUrl())}
              className="w-full px-3 py-2 text-left text-[12px] text-coral font-medium border-none bg-white hover:bg-coral-light cursor-pointer"
            >
              Copy affiliate link (earn ₹)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
