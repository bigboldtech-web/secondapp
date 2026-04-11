interface DealAlertBannerProps {
  isMobile: boolean;
}

export default function DealAlertBanner({ isMobile }: DealAlertBannerProps) {
  return (
    <div
      className={`mt-6 bg-card border border-border flex items-center justify-between gap-3 flex-wrap ${
        isMobile ? "rounded-lg px-3.5 py-3" : "rounded-[10px] px-5 py-4"
      }`}
    >
      <div>
        <p className="text-[13px] font-semibold text-text-primary mb-0.5">
          Can&apos;t find what you need?
        </p>
        <p className="text-[11px] text-text-muted">
          Get notified when new items match your search.
        </p>
      </div>
      <button className="px-3.5 py-[7px] rounded-md border border-border bg-white text-icon-active text-[11px] font-semibold cursor-pointer">
        Set alert
      </button>
    </div>
  );
}
