import Link from "next/link";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

const LINKS = [
  { key: "footer.about", href: "/about" },
  { key: "footer.help", href: "/help" },
  { key: "footer.terms", href: "/terms" },
  { key: "footer.privacy", href: "/privacy" },
];

export default async function Footer() {
  const store = await cookies();
  const locale = getLocaleFromCookie(store.get("sa_locale")?.value);

  return (
    <footer className="hidden sm:block border-t border-border py-5 bg-white">
      <div className="mx-auto max-w-[1140px] px-6 flex justify-between items-center">
        <span className="text-[10px] text-text-faint">&copy; 2026 Second App</span>
        <div className="flex gap-4">
          {LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="text-[11px] text-text-faint no-underline hover:text-text-secondary"
            >
              {t(key, locale)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
