"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  current: Locale;
}

export default function LanguageSwitcher({ current }: LanguageSwitcherProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handlePick = (locale: Locale) => {
    setOpen(false);
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  const currentLocale = LOCALES.find((l) => l.code === current) ?? LOCALES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-white text-[11px] font-medium text-text-secondary cursor-pointer"
      >
        {currentLocale.nativeLabel}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] right-0 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border overflow-hidden z-50 min-w-[120px]">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => handlePick(l.code)}
              className={`w-full px-3 py-2 text-left text-[12px] border-none cursor-pointer ${
                l.code === current
                  ? "text-coral font-semibold bg-coral-light"
                  : "text-text-secondary bg-white hover:bg-bg"
              }`}
            >
              {l.nativeLabel} <span className="text-text-muted">({l.label})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
