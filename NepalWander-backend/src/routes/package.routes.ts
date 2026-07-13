import { Router } from "express";
import packageController from "../controllers/package.controller";
import validate from "../middlewares/validate.middleware";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import {
  createPackageSchema,
  updatePackageSchema,
} from "../validators/package.validator";
import { UserRole } from "../types";

const router = Router();

// ── Public routes ─────────────────────────────────────
router.get("/", packageController.getAll);
router.get("/featured", packageController.getFeatured);
router.get("/slug/:slug", packageController.getBySlug);
router.get(
  "/destination/:destinationId",
  packageController.getByDestination
);
router.get("/:id", packageController.getById);

// ── Admin and Operator ────────────────────────────────
router.post(
  "/",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.OPERATOR),
  validate(createPackageSchema),
  packageController.create
);
router.put(
  "/:id",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.OPERATOR),
  validate(updatePackageSchema),
  packageController.update
);
router.delete(
  "/:id",
  protect,
  restrictTo(UserRole.ADMIN),
  packageController.delete
);

export default router;