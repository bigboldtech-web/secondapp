"use client";

import { useState } from "react";
import Link from "next/link";
import { registerVendor } from "@/app/auth/actions";

type Step = "account" | "store" | "kyc" | "done";

export default function VendorRegisterPage() {
  const [step, setStep] = useState<Step>("account");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeCity, setStoreCity] = useState("");
  const [storeBio, setStoreBio] = useState("");
  const [storeCategories, setStoreCategories] = useState<string[]>([]);

  const [kycType, setKycType] = useState<"aadhaar" | "pan" | "gst">("aadhaar");

  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];
  const categories = ["Phones", "Laptops", "Tablets", "MacBooks", "Cars", "Bikes", "Gaming", "Accessories"];

  const steps: { key: Step; label: string; number: number }[] = [
    { key: "account", label: "Account", number: 1 },
    { key: "store", label: "Store Details", number: 2 },
    { key: "kyc", label: "KYC Verification", number: 3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
          <span className="text-[12px] text-text-muted">Vendor Registration</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[520px]">
          {/* Progress steps */}
          {step !== "done" && (
            <div className="flex items-center justify-center gap-0 mb-8">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < currentStepIndex ? "bg-condition-likenew-bg text-condition-likenew-text" :
                      i === currentStepIndex ? "bg-coral text-white" :
                      "bg-input text-text-muted"
                    }`}>
                      {i < currentStepIndex ? "✓" : s.number}
                    </div>
                    <span className={`text-[10px] mt-1 ${i === currentStepIndex ? "text-coral font-semibold" : "text-text-muted"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-16 sm:w-24 h-px mx-2 -mt-4 ${i < currentStepIndex ? "bg-coral" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="bg-card border border-border rounded-[12px] px-6 py-6">
            {/* Step 1: Account */}
            {step === "account" && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-1">Create your vendor account</h2>
                <p className="text-[12px] text-text-muted mb-5">Start selling certified pre-owned products on Second App</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Phone *</label>
                    <div className="flex border border-border rounded-lg overflow-hidden">
                      <span className="px-3 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">+91</span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" className="flex-1 px-3 py-2.5 text-[13px] border-none bg-transparent text-text-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@business.com" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                  </div>
                </div>
                <button
                  onClick={() => setStep("store")}
                  disabled={!name.trim() || phone.length < 10 || !email.includes("@")}
                  className="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer bg-coral text-white disabled:bg-input disabled:text-text-muted disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            )}

            {/* Step 2: Store Details */}
            {step === "store" && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-1">Set up your store</h2>
                <p className="text-[12px] text-text-muted mb-5">This is how buyers will see your store</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Store Name *</label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. PhoneHub, GadgetKing" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">City *</label>
                    <select value={storeCity} onChange={(e) => setStoreCity(e.target.value)} className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary cursor-pointer">
                      <option value="">Select city</option>
                      {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">What do you sell? *</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStoreCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])}
                          className={`px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer border ${
                            storeCategories.includes(cat) ? "bg-coral-light border-coral-border text-coral" : "bg-white border-border text-text-secondary"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Store Bio</label>
                    <textarea
                      value={storeBio}
                      onChange={(e) => setStoreBio(e.target.value)}
                      placeholder="Tell buyers about your store, experience, and what makes you trustworthy..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setStep("account")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border bg-white text-text-primary cursor-pointer">
                    Back
                  </button>
                  <button
                    onClick={() => setStep("kyc")}
                    disabled={!storeName.trim() || !storeCity || storeCategories.length === 0}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer bg-coral text-white disabled:bg-input disabled:text-text-muted disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {/* Step 3: KYC */}
            {step === "kyc" && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-1">KYC Verification</h2>
                <p className="text-[12px] text-text-muted mb-5">Upload identity documents to verify your business</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-2">Document Type</label>
                    <div className="flex gap-2">
                      {([["aadhaar", "Aadhaar"], ["pan", "PAN Card"], ["gst", "GST Certificate"]] as const).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setKycType(key)}
                          className={`flex-1 py-2 rounded-md text-[11px] font-medium cursor-pointer border ${
                            kycType === key ? "bg-coral-light border-coral-border text-coral" : "bg-white border-border text-text-secondary"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      {kycType === "aadhaar" ? "Aadhaar Number" : kycType === "pan" ? "PAN Number" : "GST Number"}
                    </label>
                    <input
                      type="text"
                      placeholder={kycType === "aadhaar" ? "XXXX XXXX XXXX" : kycType === "pan" ? "ABCDE1234F" : "22AAAAA0000A1Z5"}
                      className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-2">Upload Document</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      <p className="text-[12px] text-text-muted mb-1">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-text-faint">PDF, JPG, or PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <button onClick={() => setStep("store")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border bg-white text-text-primary cursor-pointer">
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      await registerVendor({ name, phone, email, storeName, storeCity, bio: storeBio || undefined });
                      setStep("done");
                    }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer bg-coral text-white"
                  >
                    Submit for Review
                  </button>
                </div>
              </>
            )}

            {/* Done */}
            {step === "done" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-condition-likenew-bg flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-2">Application Submitted!</h2>
                <p className="text-[13px] text-text-muted mb-1">
                  Your vendor application is under review.
                </p>
                <p className="text-[13px] text-text-muted mb-6">
                  We&apos;ll verify your documents and notify you within 24-48 hours.
                </p>
                <Link href="/" className="inline-block px-6 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold no-underline">
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
