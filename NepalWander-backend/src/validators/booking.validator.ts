import { z } from "zod";
import { PaymentMethod } from "../models/Booking.model";

const travelerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .trim(),
  email: z
    .string()
    .email("Valid email is required")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .trim(),
  nationality: z
    .string()
    .min(2, "Nationality is required")
    .trim(),
  passportNumber: z.string().trim().optional(),
});

export const createBookingSchema = z.object({
  packageId: z
    .string()
    .min(1, "Package ID is required"),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid start date"
    ),

  travelers: z
    .array(travelerSchema)
    .min(1, "At least one traveler is required"),

  paymentMethod: z.enum(
    Object.values(PaymentMethod) as [string, ...string[]]
  ),

  specialRequests: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a reason of at least 10 characters")
    .trim(),
});

export const updatePaymentSchema = z.object({
  transactionId: z
    .string()
    .min(1, "Transaction ID is required"),
  paymentMethod: z.enum(
    Object.values(PaymentMethod) as [string, ...string[]]
  ),
});

export const bookingQuerySchema = z.object({
  status: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;