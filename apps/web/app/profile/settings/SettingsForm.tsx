"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/types";
import { updateProfile } from "./actions";

interface SettingsFormProps {
  initial: { name: string; email: string; city: string };
}

export default function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [city, setCity] = useState(initial.city);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await updateProfile({ name, email, city });
    setSaving(false);
    if ("error" in res && res.error) {
      setMessage({ kind: "err", text: res.error });
      return;
    }
    setMessage({ kind: "ok", text: "Profile updated." });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-border">
        <div className="mx-auto max-w-[600px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/profile" className="text-text-muted no-underline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <span className="text-[14px] font-semibold text-text-primary">Settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 sm:px-6 py-6">
        <form onSubmit={save} className="bg-card border border-border rounded-[12px] px-5 py-5">
          <h2 className="text-base font-bold text-text-primary mb-4">Edit Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary outline-none focus:border-coral-border"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary outline-none focus:border-coral-border"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary cursor-pointer outline-none focus:border-coral-border"
              >
                <option value="">Select city</option>
                {CITIES.filter((c) => c !== "All India").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 px-3 py-2 text-[12px] font-medium rounded-lg ${
                message.kind === "ok"
                  ? "bg-condition-likenew-bg text-condition-likenew-text"
                  : "bg-condition-rough-bg text-condition-rough-text"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-5 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
