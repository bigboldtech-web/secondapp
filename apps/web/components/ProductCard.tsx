"use client";

import { useState } from "react";
import Link from "next/link";
import { ListingCardData, CONDITION_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { formatPrice, formatTimeAgo } from "@/lib/utils";

interface ProductCardProps {
  item: ListingCardData;
  compact?: boolean;
}

export default function ProductCard({ item, compact = false }: ProductCardProps) {
  const [saved, setSaved] = useState(false);
  const icon = CATEGORY_ICONS[item.categorySlug] || CATEGORY_ICONS.phones;
  const condStyle = CONDITION_COLORS[item.condition] || { bg: "bg-gray-100", text: "text-gray-700" };
  const specEntries = Object.values(item.specs).slice(0, 2);

  return (
    <Link href={`/listing/${item.id}`} className="no-underline text-inherit block">
      <div
        className={`bg-card overflow-hidden border border-border cursor-pointer transition-all duration-150 ${
          compact ? "rounded-lg" : "rounded-[10px] hover:-translate-y-px hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
        }`}
      >
        <div
          className={`bg-input flex items-center justify-center relative ${
            compact ? "aspect-square" : "aspect-[4/3]"
          }`}
        >
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <svg width={compact ? 24 : 32} height={compact ? 24 : 32} viewBox="0 0 24 24" fill="#ccc">
              <path d={icon} />
            </svg>
          )}

          <span
            className={`absolute ${compact ? "bottom-1 left-1 text-[9px] px-1 py-px" : "bottom-2 left-2 text-[10px] px-1.5 py-0.5"} font-semibold rounded-[3px] ${condStyle.bg} ${condStyle.text}`}
          >
            {item.condition}
          </span>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
            className={`absolute ${compact ? "top-1 right-1 w-6 h-6" : "top-2 right-2 w-7 h-7"} rounded-full border-none bg-white/85 cursor-pointer flex items-center justify-center`}
          >
            <svg
              width={compact ? 11 : 13}
              height={compact ? 11 : 13}
              viewBox="0 0 24 24"
              fill={saved ? "#E8553D" : "none"}
              stroke={saved ? "#E8553D" : "#999"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          {item.adminCertified && (
            <span className={`absolute ${compact ? "top-1 left-1 text-[8px] px-1" : "top-2 left-2 text-[9px] px-1.5 py-0.5"} bg-coral text-white font-semibold rounded-[3px]`}>
              CERTIFIED
            </span>
          )}
        </div>

        <div className={compact ? "px-2 pt-1.5 pb-2" : "px-3 pt-2.5 pb-3"}>
          <p className={`font-bold text-[#111] ${compact ? "text-[13px] mb-px" : "text-[15px] mb-[3px]"}`}>
            {formatPrice(item.price)}
          </p>
          <p
            className={`font-medium text-[#444] overflow-hidden text-ellipsis whitespace-nowrap leading-tight ${
              compact ? "text-[11px] mb-[3px]" : "text-[13px] mb-1.5"
            }`}
          >
            {item.title}
          </p>

          {!compact && specEntries.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-1.5">
              {specEntries.map((s) => (
                <span
                  key={s}
                  className="text-[10px] text-text-secondary bg-input-light px-[5px] py-[2px] rounded-[3px]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div
            className={`flex items-center justify-between text-text-muted ${
              compact ? "text-[10px]" : "text-[11px]"
            }`}
          >
            <span>{item.location}</span>
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
