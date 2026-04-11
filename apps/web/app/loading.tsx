export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-coral rounded-full animate-spin" />
        <span className="text-[12px] text-text-muted">Loading...</span>
      </div>
    </div>
  );
}
