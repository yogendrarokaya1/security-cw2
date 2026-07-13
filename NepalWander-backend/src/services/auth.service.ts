import { UserRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash.util";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util";
import { generateOtp } from "../utils/otp.util";
import emailService from "./email.service";
import { UserRole, AccountStatus } from "../types";
import {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/auth.validator";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../middlewares/error.middleware";
import { ENV } from "../config/env";

const userRepository = new UserRepository();

// ── Helper: send email or log OTP in development ──────
const sendEmail = async (
  type: "verification" | "reset" | "resend",
  email: string,
  firstName: string,
  otp: string
): Promise<void> => {
  if (ENV.NODE_ENV === "production") {
    if (type === "verification" || type === "resend") {
      await emailService.sendVerificationEmail(
        email,
        firstName,
        otp
      );
    } else if (type === "reset") {
      await emailService.sendPasswordResetEmail(
        email,
        firstName,
        otp
      );
    }
  } else {
    // Development — print OTP to terminal
    console.log("\n──────────────────────────────────────");
    console.log(`📧  To    : ${email}`);
    console.log(`👤  Name  : ${firstName}`);
    console.log(`🔑  OTP   : ${otp}`);
    console.log(`⏱️   Expires in 10 minutes`);
    console.log("──────────────────────────────────────\n");
  }
};

class AuthService {

  // ── REGISTER ─────────────────────────────────────────
  async register(input: RegisterInput) {
    const {
      firstName,
      lastName,
      email,
      password,
      nationality,
    } = input;

    // Default to tourist if no role given
    const role = (input.role as UserRole) || UserRole.TOURIST;

    // Block admin registration via API
    if (role === UserRole.ADMIN) {
      throw new BadRequestError("Invalid role");
    }

    // Only these roles allowed
    const allowed = [
      UserRole.TOURIST,
      UserRole.GUIDE,
      UserRole.OPERATOR,
    ];
    if (!allowed.includes(role)) {
      throw new BadRequestError("Invalid role selected");
    }

    // Check duplicate email
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Generate OTP
    const { otp, otpExpires } = generateOtp();

    // Tourist = auto approved, guide/operator = pending
    const accountStatus =
      role === UserRole.TOURIST
        ? AccountStatus.APPROVED
        : AccountStatus.PENDING;

    // Create user
    await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      nationality,
      accountStatus,
      isVerified: false,
      isActive: true,
      otp,
      otpExpires,
    });

    // Send OTP email or print to terminal in dev
    await sendEmail("verification", email, firstName, otp);

    const message =
      role === UserRole.TOURIST
        ? "Registered successfully. Please check your email for OTP."
        : `Registered successfully. Verify your email. Your ${role} account needs admin approval.`;

    return { message };
  }

  // ── VERIFY OTP ────────────────────────────────────────
  async verifyOtp(input: VerifyOtpInput) {
    const { email, otp } = input;

    const user = await userRepository.findByEmailWithOtp(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) {
      throw new BadRequestError("Email already verified");
    }

    if (user.otp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestError(
        "OTP expired. Please request a new one."
      );
    }

    await userRepository.update(user._id.toString(), {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });

    if (
      user.role === UserRole.GUIDE ||
      user.role === UserRole.OPERATOR
    ) {
      return {
        requiresApproval: true,
        accessToken: null,
        refreshToken: null,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: true,
          accountStatus: user.accountStatus,
        },
        message:
          "Email verified. Your account is pending admin approval.",
      };
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    await userRepository.saveRefreshToken(
      user._id.toString(),
      refreshToken
    );

    return {
      requiresApproval: false,
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: true,
        accountStatus: user.accountStatus,
      },
      message: "Email verified successfully.",
    };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    const user =
      await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await comparePassword(
      password,
      user.password
    );
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isVerified) {
      throw new BadRequestError(
        "Please verify your email first. Check your inbox."
      );
    }

    if (
      (user.role === UserRole.GUIDE ||
        user.role === UserRole.OPERATOR) &&
      user.accountStatus === AccountStatus.PENDING
    ) {
      throw new ForbiddenError(
        "Your account is pending admin approval."
      );
    }

    if (user.accountStatus === AccountStatus.REJECTED) {
      throw new ForbiddenError(
        "Your account was rejected. Contact support."
      );
    }

    if (
      !user.isActive ||
      user.accountStatus === AccountStatus.SUSPENDED
    ) {
      throw new ForbiddenError(
        "Your account is suspended. Contact support."
      );
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    await userRepository.saveRefreshToken(
      user._id.toString(),
      refreshToken
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        accountStatus: user.accountStatus,
        profileImage: user.profileImage,
      },
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      // Never reveal if email exists
      return {
        message:
          "If this email exists, a reset OTP has been sent.",
      };
    }

    const { otp, otpExpires } = generateOtp();
    await userRepository.saveOtp(input.email, otp, otpExpires);

    // Send reset email or print to terminal in dev
    await sendEmail(
      "reset",
      input.email,
      user.firstName,
      otp
    );

    return { message: "Password reset OTP sent to your email." };
  }

  async resetPassword(input: ResetPasswordInput) {
    const { email, otp, newPassword } = input;

    const user = await userRepository.findByEmailWithOtp(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.otp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestError(
        "OTP expired. Please request a new one."
      );
    }

    const hashed = await hashPassword(newPassword);

    await userRepository.update(user._id.toString(), {
      password: hashed,
      otp: undefined,
      otpExpires: undefined,
    });

    return { message: "Password reset successfully." };
  }

  async resendOtp(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const { otp, otpExpires } = generateOtp();
    await userRepository.saveOtp(email, otp, otpExpires);

    // Send OTP email or print to terminal in dev
    await sendEmail("resend", email, user.firstName, otp);

    return { message: "New OTP sent to your email." };
  }

  // Add this method to AuthService class in auth.service.ts

async updateProfile(userId: string, input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  profileImage?: string;
}) {
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const updated = await userRepository.update(userId, {
    ...(input.firstName && { firstName: input.firstName }),
    ...(input.lastName && { lastName: input.lastName }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.nationality !== undefined && { nationality: input.nationality }),
    ...(input.profileImage !== undefined && { profileImage: input.profileImage }),
  });

  return updated;
}

  async logout(userId: string) {
    await userRepository.clearRefreshToken(userId);
    return { message: "Logged out successfully." };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}

export default new AuthService();