"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/auth/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];
  const isValid = name.trim().length >= 2 && phone.length === 10;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="bg-card border border-border rounded-[12px] px-6 py-8">
            <h1 className="text-xl font-bold text-text-primary text-center mb-1">Create your account</h1>
            <p className="text-[13px] text-text-muted text-center mb-6">
              Join Second App to buy certified pre-owned products
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true); setError("");
              const result = await registerUser({ name, phone, email: email || undefined, city: city || undefined });
              if (result.error) { setError(result.error); setLoading(false); }
              else { router.push("/"); router.refresh(); }
            }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2.5 text-[13px] text-text-primary border border-border rounded-lg bg-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Phone Number *</label>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-text-muted">
                    <span className="px-3 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      className="flex-1 px-3 py-2.5 text-[13px] text-text-primary border-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 text-[13px] text-text-primary border border-border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] text-text-primary border border-border rounded-lg bg-white cursor-pointer"
                  >
                    <option value="">Select your city</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="text-[12px] text-condition-rough-text mt-3">{error}</p>}
              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full mt-5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer ${
                  isValid && !loading ? "bg-coral text-white" : "bg-input text-text-muted cursor-not-allowed"
                }`}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-border text-center">
              <p className="text-[12px] text-text-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-coral font-semibold no-underline">Log in</Link>
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-faint text-center mt-4">
            Are you a dealer?{" "}
            <Link href="/vendor/register" className="text-coral font-medium no-underline">Register as a vendor</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
