import { Response } from "express";
import bookingService from "../services/booking.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import {
  bookingQuerySchema,
  cancelBookingSchema,
  createBookingSchema,
  updatePaymentSchema,
} from "../validators/booking.validator";
import { BookingStatus } from "../models/Booking.model";
import validate from "../middlewares/validate.middleware";

// Helper
const getParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

class BookingController {

  // POST /api/v1/bookings
  create = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const result = await bookingService.create(
        req.body,
        req.user!.id
      );
      ApiResponse.created(
        res,
        result.message,
        {
          booking: result.booking,
          summary: result.summary,
        }
      );
    }
  );

  // GET /api/v1/bookings/my-bookings
  getMyBookings = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const bookings = await bookingService.getMyBookings(
        req.user!.id
      );
      ApiResponse.success(
        res,
        "Bookings fetched",
        bookings
      );
    }
  );

  // GET /api/v1/bookings/:id
  getById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const booking = await bookingService.getById(
        id,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(res, "Booking fetched", booking);
    }
  );

  // GET /api/v1/bookings/number/:bookingNumber
  getByBookingNumber = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const bookingNumber = getParam(
        req.params.bookingNumber
      );
      const booking =
        await bookingService.getByBookingNumber(
          bookingNumber
        );
      ApiResponse.success(res, "Booking fetched", booking);
    }
  );

  // PATCH /api/v1/bookings/:id/cancel
  cancel = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const result = await bookingService.cancel(
        id,
        req.body,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(
        res,
        result.message,
        result.booking
      );
    }
  );

  // PATCH /api/v1/bookings/:id/confirm-payment
  confirmPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const result = await bookingService.confirmPayment(
        id,
        req.body
      );
      ApiResponse.success(
        res,
        result.message,
        result.booking
      );
    }
  );

  // GET /api/v1/admin/bookings
  getAllBookings = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const query = bookingQuerySchema.parse(req.query);
      const result = await bookingService.getAllBookings(
        query
      );
      ApiResponse.success(
        res,
        "Bookings fetched",
        result
      );
    }
  );

  // PATCH /api/v1/admin/bookings/:id/status
  updateStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const { status } = req.body;
      const result = await bookingService.updateStatus(
        id,
        status as BookingStatus
      );
      ApiResponse.success(
        res,
        result.message,
        result.booking
      );
    }
  );
}

export default new BookingController();