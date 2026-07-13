import { Router } from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import uploadController from "../controllers/upload.controller";
import { UserRole } from "../types";

const router = Router();

// Use memory storage — file goes directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Admin only upload routes
router.post(
  "/",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.OPERATOR),
  upload.single("image"),
  uploadController.uploadImage
);

router.post(
  "/multiple",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.OPERATOR),
  upload.array("images", 10),
  uploadController.uploadMultiple
);

export default router;