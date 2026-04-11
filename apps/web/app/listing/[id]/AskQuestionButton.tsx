"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startChat } from "@/app/inbox/actions";

export default function AskQuestionButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await startChat(listingId);
    if (result.error) {
      router.push("/login");
    } else if (result.chatId) {
      router.push(`/inbox/${result.chatId}`);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-2.5 rounded-[10px] border border-border bg-white text-text-primary text-[12px] font-semibold cursor-pointer hover:bg-bg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {loading ? "Opening chat..." : "Ask a Question"}
    </button>
  );
}
