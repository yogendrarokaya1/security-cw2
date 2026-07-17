import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import destinationRoutes from "./destination.routes";
import packageRoutes from "./package.routes";
import bookingRoutes from "./booking.routes";
import guideRoutes from "./guide.routes";
import plannerRoutes from "./planner.routes";
import uploadRoutes from "./upload.routes";
import mfaRoutes from "./mfa.routes";

const router = Router();

router.use("/upload", uploadRoutes);

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/destinations", destinationRoutes);
router.use("/packages", packageRoutes);
router.use("/bookings", bookingRoutes);
router.use("/guides", guideRoutes);
router.use("/planner", plannerRoutes);
router.use("/mfa", mfaRoutes);

export default router;