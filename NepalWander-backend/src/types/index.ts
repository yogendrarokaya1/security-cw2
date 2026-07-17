import { Request } from "express";

export enum UserRole {
  TOURIST = "tourist",
  GUIDE = "guide",
  OPERATOR = "operator",
  ADMIN = "admin",
}

export enum AccountStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isSuperAdmin?: boolean;
  nationality?: string;
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  otp?: string;
  otpExpires?: Date;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // ── Brute-force / account lockout ─────────────────
  failedLoginAttempts?: number;
  lockUntil?: Date | null;

  // ── Password history ──────────────────────────────
  passwordHistory?: string[];

  // ── MFA (TOTP) ────────────────────────────────────
  mfaSecret?: string;
  mfaEnabled?: boolean;
  mfaTempSecret?: string;

  // ── OAuth ─────────────────────────────────────────
  googleId?: string;
  authProvider?: "local" | "google";
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/auth.validator";