"use client";

import { useState } from "react";
import { reportListing } from "./actions";

const REASONS = [
  { value: "fake", label: "Fake or misleading" },
  { value: "spam", label: "Spam" },
  { value: "wrong_price", label: "Wrong price" },
  { value: "offensive", label: "Offensive content" },
  { value: "other", label: "Other" },
];

export default function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError("");
    const res = await reportListing(listingId, reason, details);
    setSubmitting(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <p className="text-[11px] text-text-muted mt-2">
        Reported — our team will review this listing. Thank you.
      </p>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="text-[11px] text-text-muted mt-2 border-none bg-transparent cursor-pointer hover:text-text-secondary"
      >
        Report this listing
      </button>

      {open && (
        <div className="mt-2 bg-card border border-border rounded-lg px-3 py-3 space-y-2">
          <p className="text-[11px] font-semibold text-text-primary">Why are you reporting this?</p>
          <div className="space-y-1">
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-coral"
                />
                <span className="text-[12px] text-text-secondary">{r.label}</span>
              </label>
            ))}
          </div>
          {reason === "other" && (
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us more..."
              rows={2}
              maxLength={500}
              className="w-full text-[12px] px-2 py-1.5 border border-border rounded-md bg-white text-text-primary resize-none outline-none"
            />
          )}
          {error && <p className="text-[11px] text-condition-rough-text">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="text-[11px] px-3 py-1.5 rounded-md bg-coral text-white font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Submit report"}
            </button>
            <button
              onClick={() => { setOpen(false); setReason(""); setDetails(""); }}
              className="text-[11px] px-3 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
