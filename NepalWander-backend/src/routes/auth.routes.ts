import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate.middleware";
import { protect } from "../middlewares/auth.middleware";
import rateLimit from "express-rate-limit";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  updateProfileSchema,
} from "../validators/auth.validator";

const router = Router();

// ── Strict limiters for sensitive auth endpoints ──────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many accounts created. Try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many reset attempts. Try again in 1 hour.",
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

export default router;