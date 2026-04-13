"use server";

import { cookies } from "next/headers";
import type { Locale } from "./index";

export async function setLocale(locale: Locale) {
  const store = await cookies();
  store.set("sa_locale", locale, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
}
