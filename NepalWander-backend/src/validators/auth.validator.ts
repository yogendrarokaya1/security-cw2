import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .trim(),

  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must have uppercase, lowercase and a number"
    ),

  role: z
    .enum(["tourist", "guide", "operator"])
    .default("tourist"),

  nationality: z
    .string()
    .min(2, "Nationality must be valid")
    .trim()
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .email("Valid email is required")
    .toLowerCase()
    .trim(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Valid email is required")
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Valid email is required")
    .toLowerCase()
    .trim(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must have uppercase, lowercase and a number"
    ),
});



export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").trim().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").trim().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  profileImage: z.string().optional(),
});


export const resendOtpSchema = z.object({
  email: z
    .string()
    .email("Valid email is required")
    .toLowerCase()
    .trim(),
});

// ── Auto generated types from schemas ─────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
