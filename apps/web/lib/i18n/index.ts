// Lightweight i18n. No external library — just a dictionary lookup with
// fallback to English. Translations load from JSON files in this directory.
// Server components call t() directly; client components use the useT() hook.

import en from "./en.json";
import hi from "./hi.json";

export type Locale = "en" | "hi";
export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

const dictionaries: Record<Locale, Record<string, string>> = { en, hi };

export function t(key: string, locale: Locale = "en"): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}

export function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue === "hi") return "hi";
  return "en";
}
