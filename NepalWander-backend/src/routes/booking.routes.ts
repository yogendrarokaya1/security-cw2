import { Router } from "express";
import bookingController from "../controllers/booking.controller";
import validate from "../middlewares/validate.middleware";
import {
  protect,
  restrictTo,
} from "../middlewares/auth.middleware";
import {
  createBookingSchema,
  cancelBookingSchema,
  updatePaymentSchema,
} from "../validators/booking.validator";
import { UserRole } from "../types";

const router = Router();

// All booking routes require login
router.use(protect);

// ── Tourist routes ────────────────────────────────────
router.post(
  "/",
  restrictTo(UserRole.TOURIST),
  validate(createBookingSchema),
  bookingController.create
);
router.get(
  "/my-bookings",
  bookingController.getMyBookings
);
router.get(
  "/number/:bookingNumber",
  bookingController.getByBookingNumber
);
router.get("/:id", bookingController.getById);
router.patch(
  "/:id/cancel",
  validate(cancelBookingSchema),
  bookingController.cancel
);
router.patch(
  "/:id/confirm-payment",
  validate(updatePaymentSchema),
  bookingController.confirmPayment
);

export default router;