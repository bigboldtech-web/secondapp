export default function Footer() {
  return (
    <footer className="hidden sm:block border-t border-border py-5 bg-white">
      <div className="mx-auto max-w-[1140px] px-6 flex justify-between items-center">
        <span className="text-[10px] text-text-faint">&copy; 2026 Second App</span>
        <div className="flex gap-4">
          {["About", "Help", "Terms", "Privacy"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[11px] text-text-faint no-underline hover:text-text-secondary"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
