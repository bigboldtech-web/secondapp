"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendOtp, verifyOtp } from "@/app/auth/actions";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setError("");
    const result = await sendOtp(phone);
    if (result.error) { setError(result.error); }
    else { setStep("otp"); }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[380px]">
          <div className="bg-card border border-border rounded-[12px] px-6 py-8">
            <h1 className="text-xl font-bold text-text-primary text-center mb-1">Welcome back</h1>
            <p className="text-[13px] text-text-muted text-center mb-6">
              {step === "phone" ? "Enter your phone number to continue" : `Enter the OTP sent to +91 ${phone}`}
            </p>

            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit}>
                <label className="block text-[11px] font-medium text-text-secondary mb-1.5">Phone Number</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden mb-4 focus-within:border-text-muted">
                  <span className="px-3 py-2.5 text-[13px] text-text-muted bg-input-light border-r border-border">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-3 py-2.5 text-[13px] text-text-primary border-none bg-transparent"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={phone.length < 10}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors ${
                    phone.length >= 10
                      ? "bg-coral text-white"
                      : "bg-input text-text-muted cursor-not-allowed"
                  }`}
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-2">Enter OTP</label>
                <div className="flex gap-2 mb-4 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-bold border border-border rounded-lg text-text-primary bg-white focus:border-coral"
                    />
                  ))}
                </div>
                <button
                  disabled={otp.some((d) => !d) || loading}
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    const result = await verifyOtp(phone, otp.join(""));
                    if (result.error) { setError(result.error); setLoading(false); }
                    else { router.push("/"); router.refresh(); }
                  }}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors ${
                    otp.every((d) => d)
                      ? "bg-coral text-white"
                      : "bg-input text-text-muted cursor-not-allowed"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                {error && <p className="text-[12px] text-condition-rough-text mt-2 text-center">{error}</p>}
                <button
                  onClick={() => setStep("phone")}
                  className="w-full mt-2 py-2 text-[12px] text-text-muted bg-transparent border-none cursor-pointer hover:text-text-secondary"
                >
                  Change phone number
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-[12px] text-text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-coral font-semibold no-underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-faint text-center mt-4">
            Are you a dealer?{" "}
            <Link href="/vendor/register" className="text-coral font-medium no-underline">
              Register as a vendor
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
