"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t, getLocaleFromCookie, type Locale } from "@/lib/i18n";

interface DealAlertBannerProps {
  isMobile: boolean;
}

export default function DealAlertBanner({ isMobile }: DealAlertBannerProps) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("sa_locale="))?.split("=")[1];
    setLocale(getLocaleFromCookie(cookie));
  }, []);

  return (
    <div
      className={`mt-6 bg-card border border-border flex items-center justify-between gap-3 flex-wrap ${
        isMobile ? "rounded-lg px-3.5 py-3" : "rounded-[10px] px-5 py-4"
      }`}
    >
      <div>
        <p className="text-[13px] font-semibold text-text-primary mb-0.5">
          {t("alert.cant_find", locale)}
        </p>
        <p className="text-[11px] text-text-muted">
          {t("alert.get_notified", locale)}
        </p>
      </div>
      <Link
        href="/alerts"
        className="px-3.5 py-[7px] rounded-md border border-border bg-white text-icon-active text-[11px] font-semibold no-underline"
      >
        {t("alert.set", locale)}
      </Link>
    </div>
  );
}
