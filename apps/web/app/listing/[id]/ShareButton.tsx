"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", fullUrl);
    }
  };

  return (
    <button
      onClick={handleShare}
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
  );
}
