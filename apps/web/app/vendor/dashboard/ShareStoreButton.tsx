"use client";

import { useState } from "react";

interface ShareStoreButtonProps {
  storeSlug: string;
  storeName: string;
}

export default function ShareStoreButton({ storeSlug, storeName }: ShareStoreButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/store/${storeSlug}`
      : `/store/${storeSlug}`;

    // Prefer the native share sheet on mobile, fall back to clipboard.
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: storeName, url });
        return;
      } catch {
        // user cancelled — fall through to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="px-3 py-1.5 rounded-md border border-border bg-white text-[12px] font-medium text-text-primary cursor-pointer"
    >
      {copied ? "Link copied ✓" : "Share store"}
    </button>
  );
}
