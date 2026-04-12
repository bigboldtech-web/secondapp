"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateListing, deleteListing, updateListingStatus } from "@/app/actions";

interface EditableListing {
  id: string;
  productName: string;
  brandName: string;
  modelName: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  condition: string;
  conditions: string[];
  description: string | null;
  specs: Record<string, string>;
  photos: string[];
  videoUrl: string | null;
  status: string;
}

interface ListingEditFormProps {
  listing: EditableListing;
}

export default function ListingEditForm({ listing }: ListingEditFormProps) {
  const router = useRouter();

  const [price, setPrice] = useState(String(Math.round(listing.price)));
  const [originalPrice, setOriginalPrice] = useState(
    listing.originalPrice ? String(Math.round(listing.originalPrice)) : ""
  );
  const [quantity, setQuantity] = useState(String(listing.quantity));
  const [condition, setCondition] = useState(listing.condition);
  const [description, setDescription] = useState(listing.description ?? "");
  const [photos, setPhotos] = useState<string[]>(listing.photos);
  const [videoUrl, setVideoUrl] = useState<string | null>(listing.videoUrl);
  const [specs, setSpecs] = useState<Record<string, string>>(listing.specs);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const upload = async (file: File, kind: "listing-photo" | "listing-video"): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setUploadError(body.error || "Upload failed");
      return null;
    }
    return body.url as string;
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setUploadError("");
    const added: string[] = [];
    for (const file of Array.from(files).slice(0, 10 - photos.length)) {
      const url = await upload(file, "listing-photo");
      if (url) added.push(url);
    }
    setPhotos((prev) => [...prev, ...added].slice(0, 10));
    setUploading(false);
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const url = await upload(file, "listing-video");
    if (url) setVideoUrl(url);
    setUploading(false);
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const priceNum = parseInt(price, 10);
    if (!priceNum || priceNum <= 0) {
      setMessage({ kind: "err", text: "Please enter a valid price." });
      setSaving(false);
      return;
    }

    const res = await updateListing(listing.id, {
      price: priceNum,
      originalPrice: originalPrice ? parseInt(originalPrice, 10) : null,
      quantity: parseInt(quantity, 10) || 1,
      condition,
      description: description || null,
      specs,
      photos,
      videoUrl,
    });
    setSaving(false);
    if ("error" in res) {
      setMessage({ kind: "err", text: res.error ?? "Save failed" });
      return;
    }
    setMessage({ kind: "ok", text: "Saved. Buyers see the update immediately." });
    router.refresh();
  };

  const togglePaused = async () => {
    setSaving(true);
    const next = listing.status === "active" ? "expired" : "active";
    const res = await updateListingStatus(listing.id, next);
    setSaving(false);
    if ("error" in res) {
      setMessage({ kind: "err", text: res.error ?? "Could not change status" });
      return;
    }
    router.push("/vendor/listings/manage");
    router.refresh();
  };

  const doDelete = async () => {
    setSaving(true);
    const res = await deleteListing(listing.id);
    setSaving(false);
    if ("error" in res) {
      setMessage({ kind: "err", text: res.error ?? "Delete failed" });
      setConfirmDelete(false);
      return;
    }
    router.push("/vendor/listings/manage");
    router.refresh();
  };

  const discount =
    originalPrice && parseInt(originalPrice, 10) > parseInt(price || "0", 10)
      ? Math.round(((parseInt(originalPrice, 10) - parseInt(price, 10)) / parseInt(originalPrice, 10)) * 100)
      : null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[720px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/listings/manage" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted truncate">Edit · {listing.productName}</span>
          <Link
            href={`/listing/${listing.id}`}
            className="ml-auto text-[12px] text-coral font-semibold no-underline"
          >
            View →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 sm:px-6 py-6">
        <form onSubmit={save} className="space-y-5">
          {/* Read-only product header */}
          <section className="bg-card border border-border rounded-[10px] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">Product</p>
            <p className="text-[14px] font-bold text-text-primary">{listing.productName}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {listing.categoryName} · {listing.brandName} {listing.modelName}
            </p>
            <p className="text-[10px] text-text-muted mt-1">
              Category/brand/model are locked — create a new listing if you picked the wrong one.
            </p>
          </section>

          {/* Photos + Video */}
          <section className="bg-card border border-border rounded-[10px] px-4 py-4">
            <h2 className="text-sm font-bold text-text-primary mb-2">Photos & video</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {photos.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-input">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    type="button"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] border-none cursor-pointer flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] px-1 py-px rounded bg-white/90 text-text-primary font-semibold">Main</span>
                  )}
                </div>
              ))}
              {photos.length < 10 && (
                <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-text-muted">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-[9px] text-text-faint mt-1">Add photo</span>
                </label>
              )}
            </div>
            <label className="block border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-text-muted transition-colors">
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={(e) => handleVideoUpload(e.target.files?.[0] || null)}
              />
              {videoUrl ? (
                <>
                  <p className="text-[12px] text-text-primary font-semibold">Video uploaded</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Tap to replace</p>
                </>
              ) : (
                <p className="text-[11px] text-text-muted">Upload video (15–60 sec, optional)</p>
              )}
            </label>
            {videoUrl && (
              <button
                type="button"
                onClick={() => setVideoUrl(null)}
                className="mt-2 text-[11px] text-text-muted border-none bg-transparent cursor-pointer"
              >
                Remove video
              </button>
            )}
            {uploading && <p className="text-[11px] text-text-muted mt-2">Uploading…</p>}
            {uploadError && <p className="text-[11px] text-condition-rough-text mt-2">{uploadError}</p>}
          </section>

          {/* Price */}
          <section className="bg-card border border-border rounded-[10px] px-4 py-4">
            <h2 className="text-sm font-bold text-text-primary mb-2">Price</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">Selling price *</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white">
                  <span className="px-2.5 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-2.5 py-2.5 text-[13px] text-text-primary bg-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">Original price</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white">
                  <span className="px-2.5 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-2.5 py-2.5 text-[13px] text-text-primary bg-transparent outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
            {discount && (
              <p className="mt-2 text-[11px] font-medium text-condition-likenew-text bg-condition-likenew-bg inline-block px-2 py-0.5 rounded">
                Buyer saves {discount}%
              </p>
            )}
            <div className="mt-3">
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Quantity in stock</label>
              <input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/\D/g, "").slice(0, 3) || "1")}
                className="w-24 px-2.5 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary outline-none"
              />
            </div>
          </section>

          {/* Condition */}
          <section className="bg-card border border-border rounded-[10px] px-4 py-4">
            <h2 className="text-sm font-bold text-text-primary mb-2">Condition</h2>
            <div className="flex flex-wrap gap-2">
              {(listing.conditions.length > 0 ? listing.conditions : [listing.condition]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium border cursor-pointer ${
                    condition === c
                      ? "bg-coral-light border-coral-border text-coral"
                      : "bg-white border-border text-text-secondary hover:bg-bg"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* Specs — display + edit each as a simple input */}
          {Object.keys(specs).length > 0 && (
            <section className="bg-card border border-border rounded-[10px] px-4 py-4">
              <h2 className="text-sm font-bold text-text-primary mb-2">Specs</h2>
              <div className="space-y-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-[11px] text-text-muted capitalize w-20 shrink-0">{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setSpecs((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-2.5 py-2 text-[13px] border border-border rounded-md bg-white text-text-primary outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="bg-card border border-border rounded-[10px] px-4 py-4">
            <h2 className="text-sm font-bold text-text-primary mb-2">Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Condition details, what's in the box, reason for selling…"
              className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary resize-none outline-none"
            />
            <p className="text-[10px] text-text-muted mt-1">{description.length}/1000</p>
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

          <div className="flex gap-2 justify-between items-center">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={saving}
              className="text-[12px] px-3 py-2 rounded-md border border-border text-condition-rough-text bg-white cursor-pointer"
            >
              Delete listing
            </button>
            <div className="flex gap-2">
              {listing.status === "active" || listing.status === "expired" ? (
                <button
                  type="button"
                  onClick={togglePaused}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg border border-border bg-white text-text-primary text-[13px] font-semibold cursor-pointer"
                >
                  {listing.status === "active" ? "Pause" : "Reactivate"}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-5 py-2.5 rounded-lg bg-coral text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(false)}>
            <div className="bg-white rounded-lg max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-text-primary mb-1">Delete this listing?</h3>
              <p className="text-[12px] text-text-muted mb-4">
                This is permanent. Buyers who had it saved will see it vanish from their wishlists.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-md border border-border text-[12px] text-text-primary bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={saving}
                  className="px-3 py-2 rounded-md bg-condition-rough-text text-white text-[12px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
