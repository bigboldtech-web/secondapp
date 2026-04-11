"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSendOtp, adminVerifyOtp } from "./actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await adminSendOtp(phone);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDevHint(Boolean(res.devMode));
    setStep("otp");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await adminVerifyOtp(phone, otp);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">
            Second <span style={{ color: "#E8553D" }}>App</span> Admin
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">Sign in with your admin phone number.</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <label className="block text-[11px] font-medium text-neutral-600">Phone</label>
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
              <span className="px-3 py-2.5 text-[13px] text-neutral-500 bg-neutral-100 border-r border-neutral-200">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit phone"
                className="flex-1 px-3 py-2.5 text-[13px] text-neutral-900 bg-transparent outline-none"
                required
              />
            </div>
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#E8553D" }}
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-[11px] font-medium text-neutral-600">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="w-full px-3 py-2.5 text-[15px] tracking-[0.3em] text-center border border-neutral-200 rounded-lg outline-none"
              required
            />
            {devHint && (
              <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
                Dev mode — OTP printed to the server console.
              </p>
            )}
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#E8553D" }}
            >
              {loading ? "Verifying…" : "Verify & Sign in"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              className="w-full py-2 text-[12px] text-neutral-500"
            >
              Use a different number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
