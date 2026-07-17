import mongoose, { Schema, Document } from "mongoose";
import { IUser, UserRole, AccountStatus } from "../types";

export interface UserDocument extends IUser, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.TOURIST,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.APPROVED,
    },
    nationality: { type: String, trim: true },
    phone: { type: String, trim: true },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },

    // ── Brute-force / account lockout ─────────────────
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Password history (reuse prevention) ───────────
    passwordHistory: {
      type: [String],
      default: [],
      select: false,
    },

    // ── MFA (TOTP) ────────────────────────────────────
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    mfaTempSecret: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpires;
  delete user.refreshToken;
  delete user.failedLoginAttempts;
  delete user.lockUntil;
  delete user.passwordHistory;
  delete user.mfaSecret;
  delete user.mfaTempSecret;
  delete user.__v;
  return user;
};

export const UserModel = mongoose.model<UserDocument>(
  "User",
  UserSchema
);