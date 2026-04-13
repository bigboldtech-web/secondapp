import en from "./en.json";
import hi from "./hi.json";
import ta from "./ta.json";
import te from "./te.json";
import bn from "./bn.json";
import mr from "./mr.json";
import kn from "./kn.json";

export type Locale = "en" | "hi" | "ta" | "te" | "bn" | "mr" | "kn";

export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
];

const VALID_LOCALES = new Set<string>(LOCALES.map((l) => l.code));

const dictionaries: Record<Locale, Record<string, string>> = { en, hi, ta, te, bn, mr, kn };

export function t(key: string, locale: Locale = "en"): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}

export function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue && VALID_LOCALES.has(cookieValue)) return cookieValue as Locale;
  return "en";
}
