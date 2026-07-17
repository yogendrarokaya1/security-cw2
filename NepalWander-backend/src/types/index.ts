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
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  passwordHistory?: string[];
  mfaSecret?: string;
  mfaEnabled?: boolean;
  mfaTempSecret?: string;
  googleId?: string;
  authProvider?: "local" | "google";
}

// ── Use a custom request that avoids Passport conflict ──
export interface AuthRequest extends Request {
  user?: any;
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