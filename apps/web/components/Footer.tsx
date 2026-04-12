import Link from "next/link";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Help", href: "/help" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="hidden sm:block border-t border-border py-5 bg-white">
      <div className="mx-auto max-w-[1140px] px-6 flex justify-between items-center">
        <span className="text-[10px] text-text-faint">&copy; 2026 Second App</span>
        <div className="flex gap-4">
          {LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[11px] text-text-faint no-underline hover:text-text-secondary"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
