"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleReaction, addComment, type ReactionData, type CommentData } from "./actions";

interface ReactionsCommentsProps {
  listingId: string;
  reactions: ReactionData;
  comments: CommentData[];
}

const REACTION_TYPES = [
  { type: "like", emoji: "👍", label: "Helpful" },
  { type: "great_price", emoji: "💰", label: "Great price" },
] as const;

export default function ReactionsComments({ listingId, reactions, comments }: ReactionsCommentsProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const handleReact = (type: string) => {
    startTransition(async () => {
      const res = await toggleReaction(listingId, type);
      if (res.error) {
        router.push("/login");
        return;
      }
      router.refresh();
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const res = await addComment(listingId, commentText.trim());
    if (res.error) {
      router.push("/login");
      setSubmitting(false);
      return;
    }
    setCommentText("");
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="bg-card border border-border rounded-[10px] px-4 sm:px-5 py-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        {REACTION_TYPES.map(({ type, emoji, label }) => {
          const count = reactions[type] ?? 0;
          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white hover:bg-coral-light hover:border-coral-border transition-colors cursor-pointer"
            >
              <span className="text-[14px]">{emoji}</span>
              <span className="text-[11px] font-medium text-text-secondary">{label}</span>
              {count > 0 && (
                <span className="text-[10px] font-bold text-coral">{count}</span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white hover:bg-bg transition-colors cursor-pointer ml-auto"
        >
          <span className="text-[14px]">💬</span>
          <span className="text-[11px] font-medium text-text-secondary">
            {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "Comment"}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="border-t border-border pt-3">
          {comments.length > 0 && (
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-input flex items-center justify-center text-[9px] font-bold text-text-muted shrink-0">
                    {c.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px]">
                      <span className="font-semibold text-text-primary">{c.userName}</span>
                      <span className="text-text-muted ml-1.5">{c.timeAgo}</span>
                    </p>
                    <p className="text-[12px] text-text-secondary">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Ask or comment..."
              maxLength={300}
              className="flex-1 px-3 py-2 text-[12px] border border-border rounded-full bg-input-light text-text-primary outline-none focus:border-coral-border"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || submitting}
              className="px-3 py-2 rounded-full bg-coral text-white text-[11px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
