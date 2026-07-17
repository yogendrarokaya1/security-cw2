import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate.middleware";
import { protect } from "../middlewares/auth.middleware";
import rateLimit from "express-rate-limit";
import passport from "../config/passport";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util";
import { ENV } from "../config/env";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  updateProfileSchema,
} from "../validators/auth.validator";
import { UserRepository } from "../repositories/user.repository";

const router = Router();
const userRepository = new UserRepository();

// ── Strict limiters for sensitive auth endpoints ──────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message:
      "Too many login attempts. Try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:
      "Too many accounts created. Try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:
      "Too many reset attempts. Try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Public routes ─────────────────────────────────────
router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  authController.register
);
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  authController.verifyOtp
);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  authController.login
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  authController.resendOtp
);

// ── Protected routes ──────────────────────────────────
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.put(
  "/profile",
  protect,
  validate(updateProfileSchema),
  authController.updateProfile
);

// ── Google OAuth routes ───────────────────────────────
// Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${ENV.CLIENT_URL}/login?error=oauth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user as any;

      const accessToken = generateAccessToken({
        id: user._id.toString(),
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user._id.toString(),
        role: user.role,
      });

      // Save refresh token to database
      await userRepository.saveRefreshToken(
        user._id.toString(),
        refreshToken
      );

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      // Redirect frontend with access token
      res.redirect(
        `${ENV.CLIENT_URL}/oauth/callback?token=${accessToken}&provider=google`
      );
    } catch {
      res.redirect(
        `${ENV.CLIENT_URL}/login?error=oauth_failed`
      );
    }
  }
);

export default router;