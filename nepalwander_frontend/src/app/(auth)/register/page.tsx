/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, Globe, Phone, Check } from "lucide-react";
import { authApi } from "@/lib/api/auth";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must have uppercase, lowercase and a number"),
  role: z.enum(["tourist", "guide"]),
  nationality: z.string().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

// ── Operator removed — only admin can create operators ─
const roles = [
  { value: "tourist", label: "Tourist", icon: "🧳", desc: "For travelers planning trips" },
  { value: "guide", label: "Guide", icon: "🏔️", desc: "Licensed Nepal trekking guides" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("tourist");
  const [agreed, setAgreed] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "tourist", agreeTerms: false },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const { agreeTerms, ...payload } = data;
      await authApi.register(payload);
      toast.success("Account created! Check your email for OTP.");
      localStorage.setItem("verifyEmail", data.email);
      router.push("/verify-otp");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[500px]">
      <div className="bg-white rounded-2xl shadow-modal p-9">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-on-surface mb-1.5">Create account</h1>
          <p className="text-sm text-outline">Join NepalWander and start exploring Nepal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Role Selector — Tourist + Guide only */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => { setSelectedRole(role.value); setValue("role", role.value as any); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer
                    ${selectedRole === role.value ? "border-primary bg-primary/5" : "border-outline-variant bg-white hover:border-outline"}`}
                >
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`text-xs font-bold ${selectedRole === role.value ? "text-primary" : "text-on-surface"}`}>
                    {role.label}
                  </span>
                  <span className="text-[10px] text-outline text-center leading-tight">{role.desc}</span>
                </button>
              ))}
            </div>

            {selectedRole === "guide" && (
              <div className="flex items-start gap-2 p-3 bg-[#FEF9EE] border border-warning rounded-lg mt-1">
                <span className="text-sm mt-0.5">⚠️</span>
                <p className="text-xs text-[#854F0B] leading-relaxed">
                  Guide accounts require admin approval before you can login.
                </p>
              </div>
            )}
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">First Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input {...register("firstName")} type="text" placeholder="Nimesh"
                  className={`input-field pl-9 ${errors.firstName ? "error" : ""}`} />
              </div>
              {errors.firstName && <p className="text-[11px] text-error">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Last Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input {...register("lastName")} type="text" placeholder="Gyawali"
                  className={`input-field pl-9 ${errors.lastName ? "error" : ""}`} />
              </div>
              {errors.lastName && <p className="text-[11px] text-error">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input {...register("email")} type="email" placeholder="your@email.com"
                className={`input-field pl-9 ${errors.email ? "error" : ""}`} />
            </div>
            {errors.email && <p className="text-[11px] text-error">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Phone Number</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 h-12 px-3 bg-surface-low border border-outline-variant rounded-lg min-w-[80px]">
                <span className="text-sm">🇳🇵</span>
                <span className="text-sm font-semibold text-on-surface">+977</span>
              </div>
              <div className="relative flex-1">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input {...register("phone")} type="tel" placeholder="98XXXXXXXX"
                  className={`input-field pl-9 ${errors.phone ? "error" : ""}`} />
              </div>
            </div>
            {errors.phone && <p className="text-[11px] text-error">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input {...register("password")} type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, uppercase + number"
                className={`input-field pl-9 pr-10 ${errors.password ? "error" : ""}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-error">{errors.password.message}</p>}
          </div>

          {/* Nationality */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
              Nationality <span className="text-outline normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input {...register("nationality")} type="text" placeholder="e.g. Nepali, British, American"
                className="input-field pl-9" />
            </div>
          </div>

          {/* Terms */}
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={() => { const next = !agreed; setAgreed(next); setValue("agreeTerms", next, { shouldValidate: true }); }}
              className="flex items-start gap-3 text-left">
              <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all duration-150
                ${agreed ? "bg-primary border-primary" : errors.agreeTerms ? "border-error bg-white" : "border-outline-variant bg-white"}`}>
                {agreed && <Check size={12} color="white" strokeWidth={3} />}
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                I agree to NepalWander&apos;s{" "}
                <Link href="/terms" onClick={(e) => e.stopPropagation()} className="text-primary font-semibold hover:underline">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" onClick={(e) => e.stopPropagation()} className="text-primary font-semibold hover:underline">Privacy Policy</Link>
              </p>
            </button>
            {errors.agreeTerms && <p className="text-[11px] text-error ml-8">{errors.agreeTerms.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-surface-container" />
          <span className="text-xs text-outline">or</span>
          <div className="flex-1 h-px bg-surface-container" />
        </div>

        <p className="text-center text-sm text-outline">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}