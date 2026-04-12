"use client";

interface PricePoint {
  label: string;
  avgPrice: number;
  count: number;
}

interface PriceHistoryProps {
  history: PricePoint[];
  currentAvg: number;
}

export default function PriceHistory({ history, currentAvg }: PriceHistoryProps) {
  if (history.length < 2) return null;

  const prices = history.map((p) => p.avgPrice);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  const formatPrice = (p: number) => `₹${Math.round(p / 100).toLocaleString("en-IN")}`;

  return (
    <div className="bg-card border border-border rounded-[10px] px-4 py-4 mb-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">Price trend</h3>
        <span className="text-[11px] text-text-muted">Avg now: {formatPrice(currentAvg)}</span>
      </div>

      <div className="flex items-end gap-1 h-20">
        {history.map((point, i) => {
          const height = ((point.avgPrice - minPrice) / range) * 60 + 10; // 10-70px
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-coral/20 hover:bg-coral/40 transition-colors relative group"
                style={{ height: `${height}px` }}
              >
                <div className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  {formatPrice(point.avgPrice)} ({point.count})
                </div>
              </div>
              <span className="text-[8px] text-text-faint truncate w-full text-center">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
