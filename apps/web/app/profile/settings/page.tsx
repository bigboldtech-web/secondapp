"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];

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
        <div className="bg-card border border-border rounded-[12px] px-5 py-5">
          <h2 className="text-base font-bold text-text-primary mb-4">Edit Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary cursor-pointer">
                <option value="">Select city</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button className="w-full mt-5 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold border-none cursor-pointer">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
