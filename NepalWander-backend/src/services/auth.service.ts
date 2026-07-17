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
import { logAuth, logSecurity } from "../utils/logger.util";

const userRepository = new UserRepository();

const PASSWORD_EXPIRY_DAYS = 90;

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
    console.log("\n──────────────────────────────────────");
    console.log(`📧  To    : ${email}`);
    console.log(`👤  Name  : ${firstName}`);
    console.log(`🔑  OTP   : ${otp}`);
    console.log(`⏱️   Expires in 10 minutes`);
    console.log("──────────────────────────────────────\n");
  }
};

class AuthService {

  // ── REGISTER ──────────────────────────────────────────
  async register(input: RegisterInput) {
    const {
      firstName,
      lastName,
      email,
      password,
      nationality,
    } = input;

    const role = (input.role as UserRole) || UserRole.TOURIST;

    if (role === UserRole.ADMIN) {
      throw new BadRequestError("Invalid role");
    }

    const allowed = [
      UserRole.TOURIST,
      UserRole.GUIDE,
      UserRole.OPERATOR,
    ];
    if (!allowed.includes(role)) {
      throw new BadRequestError("Invalid role selected");
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const hashed = await hashPassword(password);
    const { otp, otpExpires } = generateOtp();

    const accountStatus =
      role === UserRole.TOURIST
        ? AccountStatus.APPROVED
        : AccountStatus.PENDING;

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
      passwordHistory: [hashed],
      passwordChangedAt: new Date(),
    });

    await sendEmail("verification", email, firstName, otp);

    logAuth("REGISTER", {
      email,
      role,
      success: true,
    });

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

  // ── LOGIN ─────────────────────────────────────────────
  async login(input: LoginInput) {
    const { email, password } = input;

    const user =
      await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // ── Check if account is locked ────────────────────
    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - now.getTime()) / 60000
      );
      throw new ForbiddenError(
        `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
      );
    }

    const isMatch = await comparePassword(
      password,
      user.password
    );

    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 10;
      const LOCK_DURATION_MS = 30 * 60 * 1000;

      if (attempts >= MAX_ATTEMPTS) {
        await userRepository.updateLoginLock(
          user._id.toString(),
          attempts,
          new Date(Date.now() + LOCK_DURATION_MS)
        );

        logSecurity("ACCOUNT_LOCKED", {
          email,
          reason: "Account locked after 10 failed login attempts",
        });

        throw new ForbiddenError(
          "Too many failed attempts. Account locked for 30 minutes."
        );
      }

      await userRepository.updateLoginLock(
        user._id.toString(),
        attempts,
        null
      );

      logSecurity("FAILED_LOGIN", {
        email,
        reason: `Failed attempt ${attempts} of 10`,
      });

      throw new UnauthorizedError("Invalid email or password");
    }

    // ── Successful — reset lockout ────────────────────
    await userRepository.resetLoginLock(user._id.toString());

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

    // ── Check password expiry (90 days) ───────────────
    const passwordExpired = (() => {
      if (!user.passwordChangedAt) return false;
      const daysSinceChange = Math.floor(
        (Date.now() - user.passwordChangedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceChange >= PASSWORD_EXPIRY_DAYS;
    })();

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

    logAuth("LOGIN_SUCCESS", {
      userId: user._id.toString(),
      email,
      role: user.role,
      success: true,
    });

    return {
      accessToken,
      refreshToken,
      passwordExpired,
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

  // ── FORGOT PASSWORD ───────────────────────────────────
  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      return {
        message:
          "If this email exists, a reset OTP has been sent.",
      };
    }

    const { otp, otpExpires } = generateOtp();
    await userRepository.saveOtp(
      input.email,
      otp,
      otpExpires
    );

    await sendEmail(
      "reset",
      input.email,
      user.firstName,
      otp
    );

    return {
      message: "Password reset OTP sent to your email.",
    };
  }

  // ── RESET PASSWORD ────────────────────────────────────
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

    // ── Password reuse prevention ─────────────────────
    const history = await userRepository.getPasswordHistory(
      user._id.toString()
    );
    for (const oldHash of history) {
      const isReused = await comparePassword(
        newPassword,
        oldHash
      );
      if (isReused) {
        throw new BadRequestError(
          "You cannot reuse a recent password. Please choose a different one."
        );
      }
    }

    const hashed = await hashPassword(newPassword);

    await userRepository.update(user._id.toString(), {
      password: hashed,
      otp: undefined,
      otpExpires: undefined,
      passwordChangedAt: new Date(),
    });

    await userRepository.addToPasswordHistory(
      user._id.toString(),
      hashed
    );

    return { message: "Password reset successfully." };
  }

  // ── RESEND OTP ────────────────────────────────────────
  async resendOtp(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const { otp, otpExpires } = generateOtp();
    await userRepository.saveOtp(email, otp, otpExpires);

    await sendEmail("resend", email, user.firstName, otp);

    return { message: "New OTP sent to your email." };
  }

  // ── UPDATE PROFILE ────────────────────────────────────
  async updateProfile(
    userId: string,
    input: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      nationality?: string;
      profileImage?: string;
    }
  ) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const updated = await userRepository.update(userId, {
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.nationality !== undefined && {
        nationality: input.nationality,
      }),
      ...(input.profileImage !== undefined && {
        profileImage: input.profileImage,
      }),
    });

    return updated;
  }

  // ── LOGOUT ────────────────────────────────────────────
  async logout(userId: string) {
    await userRepository.clearRefreshToken(userId);

    logAuth("LOGOUT", {
      userId,
      success: true,
    });

    return { message: "Logged out successfully." };
  }

  // ── GET ME ────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}

export default new AuthService();