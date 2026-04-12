"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createListing } from "./actions";
import { getPriceSuggestion } from "./price-action";

interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  conditions: string[];
  brands: {
    id: string;
    name: string;
    models: {
      id: string;
      name: string;
      specs: Record<string, string[]>;
    }[];
  }[];
}

interface ListingWizardProps {
  catalog: CatalogCategory[];
}

type Step = "category" | "brand" | "model" | "specs" | "condition" | "photos" | "price" | "description" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "specs", label: "Specs" },
  { key: "condition", label: "Condition" },
  { key: "photos", label: "Photos" },
  { key: "price", label: "Price" },
  { key: "description", label: "Description" },
  { key: "review", label: "Review" },
];

export default function ListingWizard({ catalog }: ListingWizardProps) {
  const [step, setStep] = useState<Step>("category");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [priceSuggestion, setPriceSuggestion] = useState<{ min: number; max: number; avg: number; count: number; sameCondition: boolean } | null>(null);

  // Fetch price suggestion when entering price step
  useEffect(() => {
    if (step === "price" && modelId && condition) {
      getPriceSuggestion(modelId, condition).then((s) => setPriceSuggestion(s));
    }
  }, [step, modelId, condition]);

  const selectedCategory = catalog.find((c) => c.id === categoryId);
  const selectedBrand = selectedCategory?.brands.find((b) => b.id === brandId);
  const selectedModel = selectedBrand?.models.find((m) => m.id === modelId);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const canGoNext = () => {
    switch (step) {
      case "category": return !!categoryId;
      case "brand": return !!brandId;
      case "model": return !!modelId;
      case "specs": return Object.keys(selectedSpecs).length > 0;
      case "condition": return !!condition;
      case "photos": return photos.length >= 3 && !uploading;
      case "price": return !!price && parseInt(price) > 0;
      case "description": return true; // optional
      default: return true;
    }
  };

  const uploadSingle = async (file: File, kind: "photo" | "video") => {
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
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
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, 10 - photos.length)) {
      const url = await uploadSingle(file, "photo");
      if (url) uploaded.push(url);
    }
    setPhotos((prev) => [...prev, ...uploaded].slice(0, 10));
    setUploading(false);
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadSingle(file, "video");
    if (url) setVideoUrl(url);
    setUploading(false);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const goNext = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };

  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-condition-likenew-bg flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Listing Submitted!</h2>
            <p className="text-[13px] text-text-muted mb-6">Your listing is under review and will go live once approved.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/vendor/dashboard" className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-text-primary no-underline">
                Dashboard
              </Link>
              <button onClick={() => { setSubmitted(false); setStep("category"); setCategoryId(""); setBrandId(""); setModelId(""); setSelectedSpecs({}); setCondition(""); setPrice(""); setOriginalPrice(""); setDescription(""); setPhotos([]); setVideoUrl(null); setQuantity("1"); }} className="px-5 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold border-none cursor-pointer">
                Post Another
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-[600px] w-full px-4 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-text-muted">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
            <span className="text-[11px] font-medium text-coral">{STEPS[currentStepIndex].label}</span>
          </div>
          <div className="h-1 bg-input rounded-full overflow-hidden">
            <div
              className="h-full bg-coral rounded-full transition-all"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-[12px] px-5 py-5">
          {/* Step: Category */}
          {step === "category" && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">What are you selling?</h2>
              <p className="text-[12px] text-text-muted mb-4">Select a category</p>
              <div className="grid grid-cols-2 gap-2">
                {catalog.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryId(cat.id); setBrandId(""); setModelId(""); setSelectedSpecs({}); setCondition(""); }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      categoryId === cat.id ? "border-coral-border bg-coral-light" : "border-border bg-white hover:bg-bg"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${categoryId === cat.id ? "text-coral" : "text-text-primary"}`}>{cat.name}</p>
                    <p className="text-[10px] text-text-muted">{cat.brands.length} brands</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step: Brand */}
          {step === "brand" && selectedCategory && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Select Brand</h2>
              <p className="text-[12px] text-text-muted mb-4">{selectedCategory.name} brands</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedCategory.brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setBrandId(brand.id); setModelId(""); setSelectedSpecs({}); }}
                    className={`p-3 rounded-lg border text-left cursor-pointer ${
                      brandId === brand.id ? "border-coral-border bg-coral-light" : "border-border bg-white hover:bg-bg"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${brandId === brand.id ? "text-coral" : "text-text-primary"}`}>{brand.name}</p>
                    <p className="text-[10px] text-text-muted">{brand.models.length} models</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step: Model */}
          {step === "model" && selectedBrand && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Select Model</h2>
              <p className="text-[12px] text-text-muted mb-4">{selectedBrand.name} models</p>
              <div className="space-y-2">
                {selectedBrand.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => { setModelId(model.id); setSelectedSpecs({}); }}
                    className={`w-full p-3 rounded-lg border text-left cursor-pointer ${
                      modelId === model.id ? "border-coral-border bg-coral-light" : "border-border bg-white hover:bg-bg"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${modelId === model.id ? "text-coral" : "text-text-primary"}`}>{model.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step: Specs */}
          {step === "specs" && selectedModel && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Select Specifications</h2>
              <p className="text-[12px] text-text-muted mb-4">{selectedModel.name} variants</p>
              <div className="space-y-4">
                {Object.entries(selectedModel.specs).map(([key, options]) => (
                  <div key={key}>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1.5 capitalize">{key}</label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedSpecs((prev) => ({ ...prev, [key]: opt }))}
                          className={`px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer border ${
                            selectedSpecs[key] === opt ? "bg-coral-light border-coral-border text-coral" : "bg-white border-border text-text-secondary hover:bg-bg"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step: Condition */}
          {step === "condition" && selectedCategory && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Product Condition</h2>
              <p className="text-[12px] text-text-muted mb-4">Rate the condition honestly</p>
              <div className="space-y-2">
                {[...selectedCategory.conditions].reverse().map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={`w-full p-3 rounded-lg border text-left cursor-pointer flex items-center justify-between ${
                      condition === cond ? "border-coral-border bg-coral-light" : "border-border bg-white hover:bg-bg"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${condition === cond ? "text-coral" : "text-text-primary"}`}>{cond}</span>
                    {condition === cond && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8553D" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step: Photos */}
          {step === "photos" && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Add Photos & Video</h2>
              <p className="text-[12px] text-text-muted mb-4">Upload at least 3 photos and an optional short video.</p>
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
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-text-muted transition-colors">
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
                  <>
                    <svg className="mx-auto mb-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <p className="text-[11px] text-text-muted">Upload video (15–60 sec, optional)</p>
                  </>
                )}
              </label>
              {uploading && <p className="text-[11px] text-text-muted mt-2">Uploading…</p>}
              {uploadError && <p className="text-[11px] text-condition-rough-text mt-2">{uploadError}</p>}
              {photos.length < 3 && !uploading && (
                <p className="text-[11px] text-text-muted mt-2">At least 3 photos required to continue.</p>
              )}
            </>
          )}

          {/* Step: Price */}
          {step === "price" && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Set Your Price</h2>
              <p className="text-[12px] text-text-muted mb-3">
                {selectedModel && `Pricing for ${selectedModel.name}`}
              </p>

              {/* Price suggestion */}
              {priceSuggestion && (
                <div className="bg-condition-excellent-bg border border-[#bfdbfe] rounded-lg px-3.5 py-2.5 mb-4">
                  <p className="text-[11px] font-semibold text-condition-excellent-text mb-1">
                    Price Insight
                  </p>
                  <p className="text-[12px] text-condition-excellent-text">
                    {priceSuggestion.count} similar listing{priceSuggestion.count !== 1 ? "s" : ""}{" "}
                    {priceSuggestion.sameCondition ? `in ${condition} condition` : ""} priced between{" "}
                    <span className="font-bold">₹{priceSuggestion.min.toLocaleString("en-IN")}</span> –{" "}
                    <span className="font-bold">₹{priceSuggestion.max.toLocaleString("en-IN")}</span>
                  </p>
                  <p className="text-[10px] text-condition-excellent-text/70 mt-1">
                    Tip: Price lower to sell faster. The lowest-priced listing gets the most visibility.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Selling Price *</label>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <span className="px-3 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter price"
                      className="flex-1 px-3 py-2.5 text-[13px] text-text-primary border-none bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Original Purchase Price (optional)</label>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <span className="px-3 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value.replace(/\D/g, ""))}
                      placeholder="What did you pay?"
                      className="flex-1 px-3 py-2.5 text-[13px] text-text-primary border-none bg-transparent"
                    />
                  </div>
                </div>
                {price && originalPrice && parseInt(originalPrice) > parseInt(price) && (
                  <div className="bg-condition-likenew-bg rounded-lg px-3 py-2 text-[12px] text-condition-likenew-text font-medium">
                    Buyer saves {Math.round(((parseInt(originalPrice) - parseInt(price)) / parseInt(originalPrice)) * 100)}% off original price
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Quantity (how many units?)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value.replace(/\D/g, "").slice(0, 3) || "1")}
                    className="w-24 px-3 py-2.5 text-[13px] text-text-primary border border-border rounded-lg bg-transparent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Default is 1. Set higher if you have multiple identical units.</p>
                </div>
              </div>
            </>
          )}

          {/* Step: Description */}
          {step === "description" && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-1">Add Description</h2>
              <p className="text-[12px] text-text-muted mb-4">Any details not covered by specs (optional)</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Bought 3 months ago, barely used. Comes with original box and charger. Battery health 98%..."
                rows={5}
                className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary resize-none"
              />
              <p className="text-[10px] text-text-faint mt-1">{description.length}/500 characters</p>
            </>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-4">Review Your Listing</h2>
              <div className="space-y-3">
                <ReviewRow label="Category" value={selectedCategory?.name || ""} />
                <ReviewRow label="Brand" value={selectedBrand?.name || ""} />
                <ReviewRow label="Model" value={selectedModel?.name || ""} />
                {Object.entries(selectedSpecs).map(([key, val]) => (
                  <ReviewRow key={key} label={key} value={val} />
                ))}
                <ReviewRow label="Condition" value={condition} />
                <ReviewRow label="Price" value={price ? `₹${parseInt(price).toLocaleString("en-IN")}` : ""} />
                {originalPrice && <ReviewRow label="Original Price" value={`₹${parseInt(originalPrice).toLocaleString("en-IN")}`} />}
                {description && <ReviewRow label="Description" value={description} />}
              </div>
            </>
          )}
        </div>

        {submitError && (
          <div className="mt-3 px-3 py-2 bg-condition-rough-bg text-condition-rough-text text-[12px] font-medium rounded-lg">
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2 mt-4">
          {currentStepIndex > 0 && (
            <button onClick={goBack} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border bg-white text-text-primary cursor-pointer">
              Back
            </button>
          )}
          {step === "review" ? (
            <button
              onClick={async () => {
                setSubmitting(true);
                setSubmitError("");
                try {
                  const result = await createListing({
                    categoryId,
                    brandId,
                    modelId,
                    specs: selectedSpecs,
                    condition,
                    price: parseInt(price),
                    originalPrice: originalPrice ? parseInt(originalPrice) : undefined,
                    quantity: parseInt(quantity) || 1,
                    description: description || undefined,
                    photos,
                    videoUrl: videoUrl || undefined,
                  });
                  if (result.error) {
                    setSubmitError(result.error);
                  } else {
                    setSubmitted(true);
                  }
                } catch {
                  setSubmitError("Something went wrong. Please try again.");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-none bg-coral text-white cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Listing"}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer bg-coral text-white disabled:bg-input disabled:text-text-muted disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto max-w-[600px] px-4 h-[52px] flex items-center justify-between">
        <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
          Second <span className="text-coral">App</span>
        </Link>
        <span className="text-[12px] text-text-muted">New Listing</span>
      </div>
    </header>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-border last:border-0">
      <span className="text-[11px] font-medium text-text-muted capitalize">{label}</span>
      <span className="text-[13px] font-medium text-text-primary text-right max-w-[60%]">{value}</span>
    </div>
  );
}
