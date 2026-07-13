import { Router } from "express";
import guideController from "../controllers/guide.controller";
import validate from "../middlewares/validate.middleware";
import {
  protect,
  restrictTo,
} from "../middlewares/auth.middleware";
import {
  createGuideProfileSchema,
  updateGuideProfileSchema,
  addReviewSchema,
} from "../validators/guide.validator";
import { UserRole } from "../types";

const router = Router();

// ── Public routes ─────────────────────────────────────
router.get("/", guideController.getAll);
router.get("/:id", guideController.getById);

// ── Guide only routes ─────────────────────────────────
router.post(
  "/profile",
  protect,
  restrictTo(UserRole.GUIDE),
  validate(createGuideProfileSchema),
  guideController.createProfile
);
router.get(
  "/profile/me",
  protect,
  restrictTo(UserRole.GUIDE),
  guideController.getMyProfile
);
router.put(
  "/profile",
  protect,
  restrictTo(UserRole.GUIDE),
  validate(updateGuideProfileSchema),
  guideController.updateProfile
);
router.patch(
  "/profile/availability",
  protect,
  restrictTo(UserRole.GUIDE),
  guideController.toggleAvailability
);

// ── Tourist only — add review ─────────────────────────
router.post(
  "/review",
  protect,
  restrictTo(UserRole.TOURIST),
  validate(addReviewSchema),
  guideController.addReview
);

export default router;