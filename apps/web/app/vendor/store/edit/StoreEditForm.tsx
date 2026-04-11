"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/types";
import { updateStore } from "./actions";

interface InitialState {
  storeName: string;
  storeSlug: string;
  bio: string | null;
  locationCity: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
}

interface StoreEditFormProps {
  initial: InitialState;
}

export default function StoreEditForm({ initial }: StoreEditFormProps) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(initial.storeName);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [city, setCity] = useState(initial.locationCity ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl);
  const [uploading, setUploading] = useState<null | "logo" | "banner">(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const upload = async (file: File, kind: "store-logo" | "store-banner"): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ kind: "err", text: body.error || "Upload failed" });
      return null;
    }
    return body.url as string;
  };

  const pickLogo = async (file: File | null) => {
    if (!file) return;
    setUploading("logo");
    setMessage(null);
    const url = await upload(file, "store-logo");
    if (url) setLogoUrl(url);
    setUploading(null);
  };

  const pickBanner = async (file: File | null) => {
    if (!file) return;
    setUploading("banner");
    setMessage(null);
    const url = await upload(file, "store-banner");
    if (url) setBannerUrl(url);
    setUploading(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await updateStore({
      storeName,
      bio: bio || null,
      locationCity: city || null,
      logoUrl,
      bannerUrl,
    });
    setSaving(false);
    if (res.error) {
      setMessage({ kind: "err", text: res.error });
      return;
    }
    setMessage({ kind: "ok", text: "Saved. Changes are live on your public store." });
    router.refresh();
  };

  const publicUrl = `/store/${initial.storeSlug}`;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Edit store</span>
          <Link href={publicUrl} className="ml-auto text-[12px] text-coral font-semibold no-underline">
            View public store →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <form onSubmit={save} className="space-y-5">
          {/* Banner */}
          <section className="bg-card border border-border rounded-[10px] overflow-hidden">
            <div className="relative aspect-[16/5] bg-input">
              {bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerUrl} alt="Store banner" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[12px] text-text-muted">
                  No banner yet
                </div>
              )}
              <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-md bg-black/70 text-white text-[11px] font-medium cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => pickBanner(e.target.files?.[0] ?? null)}
                />
                {uploading === "banner" ? "Uploading…" : bannerUrl ? "Change banner" : "Upload banner"}
              </label>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl(null)}
                  className="absolute top-2 right-2 px-2 py-1 rounded-md bg-white/90 text-text-primary text-[10px] font-medium border border-border cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="px-4 py-2 text-[11px] text-text-muted">
              Recommended 1600×500. JPG, PNG or WEBP. Max 5 MB.
            </p>
          </section>

          {/* Logo + basic info */}
          <section className="bg-card border border-border rounded-[10px] px-5 py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-input border border-border overflow-hidden shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-text-muted">
                    {storeName.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => pickLogo(e.target.files?.[0] ?? null)}
                  />
                  <span className="px-3 py-1.5 rounded-md border border-border bg-white text-[12px] font-medium text-text-primary cursor-pointer inline-block">
                    {uploading === "logo" ? "Uploading…" : logoUrl ? "Change logo" : "Upload logo"}
                  </span>
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="text-[11px] text-text-muted border-none bg-transparent cursor-pointer text-left"
                  >
                    Remove logo
                  </button>
                )}
                <p className="text-[10px] text-text-muted">Square, 400×400 works best.</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Store name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                maxLength={60}
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary outline-none focus:border-coral-border"
                required
              />
              <p className="text-[10px] text-text-muted mt-1">
                Public URL: <span className="font-mono text-text-secondary">gosecond.in{publicUrl}</span> (fixed)
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary outline-none focus:border-coral-border"
              >
                <option value="">Select a city</option>
                {CITIES.filter((c) => c !== "All India").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Tell buyers what makes your store different — sourcing, certifications, specialties, return policy."
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary resize-none outline-none focus:border-coral-border"
              />
              <p className="text-[10px] text-text-muted mt-1">{bio.length}/500</p>
            </div>
          </section>

          {message && (
            <div
              className={`px-3 py-2 text-[12px] font-medium rounded-lg ${
                message.kind === "ok"
                  ? "bg-condition-likenew-bg text-condition-likenew-text"
                  : "bg-condition-rough-bg text-condition-rough-text"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Link
              href="/vendor/dashboard"
              className="px-4 py-2.5 rounded-lg border border-border bg-white text-text-primary text-[13px] font-semibold no-underline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading !== null}
              className="px-5 py-2.5 rounded-lg bg-coral text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
