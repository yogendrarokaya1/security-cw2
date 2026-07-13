/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";
import { ShieldCheck, Mail, RefreshCw } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [email, setEmail] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("verifyEmail");
    if (!stored) {
      router.push("/register");
      return;
    }
    setEmail(stored);
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: code });
      toast.success("Email verified! You can now login.");
      localStorage.removeItem("verifyEmail");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(email);
      toast.success("New OTP sent to your email");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white rounded-2xl shadow-modal p-10 text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={28} className="text-primary" />
        </div>

        {/* Header */}
        <h1 className="text-[22px] font-extrabold text-on-surface mb-2">
          Verify your email
        </h1>
        <p className="text-sm text-outline mb-2">
          We sent a 6-digit code to
        </p>

        {/* Email pill */}
        <div className="inline-flex items-center gap-1.5 bg-surface-low px-3.5 py-1.5 rounded-full mb-8">
          <Mail size={14} className="text-primary" />
          <span className="text-[13px] font-semibold text-on-surface">
            {email}
          </span>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-2.5 justify-center mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-[22px] font-bold rounded-[10px] outline-none transition-all duration-150
                ${digit
                  ? "border-2 border-primary bg-primary/5 text-on-surface"
                  : "border-[1.5px] border-outline-variant bg-white text-on-surface"
                }
                focus:border-2 focus:border-primary`}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || otp.join("").length < 6}
          className="btn-primary w-full mb-5"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 text-[13px] text-outline">
          <span>Did not receive it?</span>
          {countdown > 0 ? (
            <span className="font-semibold text-on-surface">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-1 text-primary font-bold hover:underline disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={resending ? "animate-spin" : ""}
              />
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        {/* Back */}
        <div className="mt-6 pt-5 border-t border-surface-container">
          <button
            onClick={() => router.push("/register")}
            className="text-[13px] text-outline hover:text-on-surface transition-colors"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    </div>
  );
}