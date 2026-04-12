"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reviewReport } from "./actions";

interface Report {
  id: string;
  listingId: string;
  productName: string;
  vendorName: string;
  reporterName: string;
  reporterPhone: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  fake: "Fake / misleading",
  offensive: "Offensive",
  wrong_price: "Wrong price",
  other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-condition-good-bg text-condition-good-text",
  reviewed: "bg-condition-rough-bg text-condition-rough-text",
  dismissed: "bg-input text-text-muted",
};

export default function ReportsClient({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "dismissed">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const handle = async (reportId: string, action: "reviewed" | "dismissed") => {
    setBusyId(reportId);
    await reviewReport(reportId, action);
    router.refresh();
    setBusyId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">
              Reported listings
              {pendingCount > 0 && (
                <span className="ml-2 text-sm font-bold text-white bg-[#E8553D] px-2 py-0.5 rounded-full align-middle">
                  {pendingCount}
                </span>
              )}
            </h1>
            <p className="text-[13px] text-neutral-500 mt-0.5">Review reports from buyers. &quot;Review&quot; rejects the listing; &quot;Dismiss&quot; keeps it live.</p>
          </div>
          <Link href="/" className="text-[12px] text-neutral-500 no-underline hover:text-neutral-900">← Dashboard</Link>
        </header>

        <div className="flex gap-2">
          {(["all", "pending", "reviewed", "dismissed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium border capitalize cursor-pointer ${
                filter === f
                  ? "bg-[#E8553D] text-white border-[#E8553D]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {f} {f === "pending" ? `(${pendingCount})` : ""}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-12 text-neutral-500 text-sm">No reports in this view.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[14px] font-semibold text-neutral-900">{r.productName}</p>
                    <p className="text-[11px] text-neutral-500">
                      Vendor: {r.vendorName} · Reported by {r.reporterName} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${STATUS_STYLES[r.status] ?? STATUS_STYLES.pending}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-700 mb-1">
                  <span className="font-medium">Reason:</span> {REASON_LABELS[r.reason] ?? r.reason}
                </p>
                {r.details && (
                  <p className="text-[12px] text-neutral-500 mb-2">{r.details}</p>
                )}
                {r.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handle(r.id, "reviewed")}
                      disabled={busyId === r.id}
                      className="text-[11px] px-3 py-1.5 rounded-md bg-red-50 text-red-700 font-semibold border-none cursor-pointer disabled:opacity-50"
                    >
                      {busyId === r.id ? "…" : "Remove listing"}
                    </button>
                    <button
                      onClick={() => handle(r.id, "dismissed")}
                      disabled={busyId === r.id}
                      className="text-[11px] px-3 py-1.5 rounded-md bg-neutral-100 text-neutral-600 font-semibold border-none cursor-pointer disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
