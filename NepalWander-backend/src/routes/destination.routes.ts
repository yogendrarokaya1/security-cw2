import { Router } from "express";
import destinationController from "../controllers/destination.controller";
import validate from "../middlewares/validate.middleware";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import {
  createDestinationSchema,
  updateDestinationSchema,
} from "../validators/destination.validator";
import { UserRole } from "../types";

const router = Router();

// ── Public routes ─────────────────────────────────────
router.get("/", destinationController.getAll);
router.get("/featured", destinationController.getFeatured);
router.get("/slug/:slug", destinationController.getBySlug);
router.get("/:id", destinationController.getById);

// ── Admin only ────────────────────────────────────────
router.post(
  "/",
  protect,
  restrictTo(UserRole.ADMIN),
  validate(createDestinationSchema),
  destinationController.create
);
router.put(
  "/:id",
  protect,
  restrictTo(UserRole.ADMIN),
  validate(updateDestinationSchema),
  destinationController.update
);
router.delete(
  "/:id",
  protect,
  restrictTo(UserRole.ADMIN),
  destinationController.delete
);

export default router;