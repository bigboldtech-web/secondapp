"use client";

import { useState, useEffect, useMemo } from "react";
import { ListingCardData, CategoryWithCount } from "@/lib/types";
import { t, getLocaleFromCookie, type Locale } from "@/lib/i18n";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import ProductCard from "./ProductCard";
import DealAlertBanner from "./DealAlertBanner";
import BottomNav from "./BottomNav";
interface HomepageProps {
  listings: ListingCardData[];
  categories: CategoryWithCount[];
  isLoggedIn?: boolean;
  userName?: string;
  recentlyViewed?: ListingCardData[];
  forYou?: ListingCardData[];
  footer?: React.ReactNode;
}

export default function Homepage({ listings, categories, isLoggedIn, userName, recentlyViewed, forYou, footer }: HomepageProps) {
  const [city, setCity] = useState("All India");
  const [isMobile, setIsMobile] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("sa_locale="))?.split("=")[1];
    setLocale(getLocaleFromCookie(cookie));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const filteredItems = useMemo(() => {
    if (city === "All India") return listings;
    return listings.filter((item) => item.location === city);
  }, [listings, city]);

  return (
    <div className="min-h-screen bg-bg">
      <Header city={city} setCity={setCity} categories={categories} isLoggedIn={isLoggedIn} userName={userName} />

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 pt-3 sm:pt-4 pb-24 sm:pb-12">
        {/* Recently viewed — only shown to logged-in users who have history */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <section className="mb-6">
            <h2 className={`font-bold text-text-primary mb-2 px-1 ${isMobile ? "text-sm" : "text-[15px]"}`}>
              {t("home.recently_viewed", locale)}
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {recentlyViewed.map((item) => (
                <div key={item.id} className="shrink-0" style={{ width: isMobile ? 140 : 180 }}>
                  <ProductCard item={item} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personalized "For you" */}
        {forYou && forYou.length > 0 && (
          <section className="mb-6">
            <h2 className={`font-bold text-text-primary mb-2 px-1 ${isMobile ? "text-sm" : "text-[15px]"}`}>
              Recommended for you
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {forYou.map((item) => (
                <div key={item.id} className="shrink-0" style={{ width: isMobile ? 140 : 180 }}>
                  <ProductCard item={item} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className={`font-bold text-text-primary ${isMobile ? "text-sm" : "text-[15px]"}`}>
            {t("home.fresh", locale)}
            {city !== "All India" && <span className="font-normal text-text-faint"> in {city}</span>}
          </h2>
          <span className="text-[11px] text-text-faint">{filteredItems.length} {t("home.items", locale)}</span>
        </div>

        {filteredItems.length > 0 ? (
          <ProductGrid items={filteredItems} isMobile={isMobile} />
        ) : (
          <div className="text-center py-10 px-4 text-text-faint">
            <p className="text-sm font-semibold text-text-secondary mb-1">{t("home.no_results", locale)}</p>
            <p className="text-xs mb-2.5">Try a different city</p>
            <button onClick={() => setCity("All India")} className="px-4 py-1.5 rounded-md border-none bg-text-primary text-white text-[11px] font-semibold cursor-pointer">
              {t("home.show_all", locale)}
            </button>
          </div>
        )}

        <DealAlertBanner isMobile={isMobile} />
      </main>

      {footer}
      <BottomNav />
    </div>
  );
}
