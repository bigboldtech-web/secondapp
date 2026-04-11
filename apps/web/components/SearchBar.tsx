"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  term: string;
  displayTerm: string;
  termType: string;
  redirectPath: string | null;
}

interface SearchBarProps {
  variant: "desktop" | "mobile";
  categoryId?: string | null;
}

export default function SearchBar({ variant, categoryId }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const params = new URLSearchParams({ q: trimmed });
        if (categoryId) params.set("categoryId", categoryId);
        const res = await fetch(`/api/search/suggest?${params}`, { signal: ac.signal });
        if (!res.ok) return;
        const body = (await res.json()) as { results: Suggestion[] };
        setSuggestions(body.results);
        setCursor(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSuggestions([]);
      }
    }, 150);

    return () => clearTimeout(t);
  }, [query, categoryId]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = async (s: Suggestion) => {
    setOpen(false);
    setQuery("");
    // fire-and-forget hit counter
    fetch("/api/search/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termId: s.id }),
    }).catch(() => {});

    if (s.redirectPath) {
      router.push(s.redirectPath);
    } else {
      router.push(`/search?q=${encodeURIComponent(s.term)}`);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (cursor >= 0 && suggestions[cursor]) {
      pick(suggestions[cursor]);
      return;
    }
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const isDesktop = variant === "desktop";

  return (
    <div className={`relative ${isDesktop ? "flex-1 max-w-[480px]" : "flex-1"}`} ref={wrapperRef}>
      <form onSubmit={submit}>
        <div
          className={
            isDesktop
              ? "flex items-center bg-input-light rounded-lg px-2 border-[1.5px] border-transparent transition-all focus-within:border-border focus-within:bg-white"
              : "flex items-center bg-input rounded-full px-2.5"
          }
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDesktop ? "#bbb" : "#aaa"} strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={isDesktop ? "Search for anything..." : "Search..."}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            className={
              isDesktop
                ? "flex-1 border-none bg-transparent py-2 px-1.5 text-[13px] text-text-primary outline-none"
                : "flex-1 border-none bg-transparent py-[7px] px-1.5 text-[13px] text-text-primary outline-none"
            }
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); }}
              className="border-none bg-transparent cursor-pointer text-text-faint flex p-0.5"
              aria-label="Clear"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-lg border border-border shadow-[0_8px_28px_rgba(0,0,0,0.08)] overflow-hidden z-50 max-h-[360px] overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseEnter={() => setCursor(i)}
              onClick={() => pick(s)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left border-none cursor-pointer ${
                cursor === i ? "bg-coral-light" : "bg-white hover:bg-bg"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-[13px] text-text-primary flex-1 truncate">{s.displayTerm}</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted">{s.termType}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
