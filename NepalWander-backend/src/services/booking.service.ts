import { BookingRepository } from "../repositories/booking.repository";
import { PackageRepository } from "../repositories/package.repository";
import {
  CreateBookingInput,
  CancelBookingInput,
  UpdatePaymentInput,
  BookingQuery,
} from "../validators/booking.validator";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../middlewares/error.middleware";
import {
  IBooking,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  ITraveler,
} from "../models/Booking.model";

const bookingRepository = new BookingRepository();
const packageRepository = new PackageRepository();

// ── Generate unique booking number ────────────────────
const generateBookingNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `NW-${timestamp}-${random}`;
};

class BookingService {

  // ── Create Booking ────────────────────────────────────
  async create(
    input: CreateBookingInput,
    userId: string
  ) {
    // Check package exists
    const pkg = await packageRepository.findById(
      input.packageId
    );
    if (!pkg) throw new NotFoundError("Package not found");

    // Check group size limits
    const groupSize = input.travelers.length;
    if (groupSize < pkg.groupSize.min) {
      throw new BadRequestError(
        `Minimum group size is ${pkg.groupSize.min}`
      );
    }
    if (groupSize > pkg.groupSize.max) {
      throw new BadRequestError(
        `Maximum group size is ${pkg.groupSize.max}`
      );
    }

    // Calculate dates
    const startDate = new Date(input.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.duration);

    // Validate start date is in future
    if (startDate < new Date()) {
      throw new BadRequestError(
        "Start date must be in the future"
      );
    }

    // Calculate total price
    const totalPrice = pkg.price * groupSize;

    // Generate booking number
    const bookingNumber = generateBookingNumber();

    // Cast travelers
    const travelers: ITraveler[] = input.travelers.map(
      (t) => ({
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        nationality: t.nationality,
        passportNumber: t.passportNumber,
      })
    );

    // Create booking
    const data: Partial<IBooking> = {
      bookingNumber,
      user: userId as any,
      package: input.packageId as any,
      travelers,
      groupSize,
      startDate,
      endDate,
      totalPrice,
      specialRequests: input.specialRequests,
      status: BookingStatus.PENDING,
      payment: {
        method: input.paymentMethod as PaymentMethod,
        status: PaymentStatus.UNPAID,
        amount: totalPrice,
      },
    };

    const booking = await bookingRepository.create(data);

    return {
      booking,
      message: "Booking created successfully",
      summary: {
        bookingNumber,
        package: pkg.title,
        groupSize,
        startDate,
        endDate,
        totalPrice,
        paymentStatus: PaymentStatus.UNPAID,
      },
    };
  }

  // ── Get My Bookings ───────────────────────────────────
  async getMyBookings(userId: string) {
    return bookingRepository.findByUser(userId);
  }

  // ── Get By ID ─────────────────────────────────────────
  async getById(id: string, userId: string, role: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Only owner or admin can view
    if (
      booking.user._id.toString() !== userId &&
      role !== "admin"
    ) {
      throw new ForbiddenError(
        "You do not have permission to view this booking"
      );
    }

    return booking;
  }

  // ── Get By Booking Number ─────────────────────────────
  async getByBookingNumber(bookingNumber: string) {
    const booking =
      await bookingRepository.findByBookingNumber(
        bookingNumber
      );
    if (!booking) throw new NotFoundError("Booking not found");
    return booking;
  }

  // ── Cancel Booking ────────────────────────────────────
  async cancel(
    id: string,
    input: CancelBookingInput,
    userId: string,
    role: string
  ) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Only owner or admin can cancel
    if (
      booking.user._id.toString() !== userId &&
      role !== "admin"
    ) {
      throw new ForbiddenError(
        "You do not have permission to cancel this booking"
      );
    }

    // Cannot cancel completed bookings
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestError(
        "Completed bookings cannot be cancelled"
      );
    }

    // Already cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError(
        "Booking is already cancelled"
      );
    }

    const updated = await bookingRepository.update(id, {
      status: BookingStatus.CANCELLED,
      cancelReason: input.reason,
      cancelledAt: new Date(),
    });

    return {
      booking: updated,
      message: "Booking cancelled successfully",
    };
  }

  // ── Confirm Payment ───────────────────────────────────
  async confirmPayment(
    id: string,
    input: UpdatePaymentInput
  ) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    if (booking.payment.status === PaymentStatus.PAID) {
      throw new BadRequestError("Payment already confirmed");
    }

    const updated = await bookingRepository.update(id, {
      status: BookingStatus.CONFIRMED,
      payment: {
        method: input.paymentMethod as PaymentMethod,
        status: PaymentStatus.PAID,
        amount: booking.payment.amount,
        transactionId: input.transactionId,
        paidAt: new Date(),
      },
    });

    return {
      booking: updated,
      message: "Payment confirmed successfully",
    };
  }

  // ── Admin — Get All Bookings ──────────────────────────
  async getAllBookings(query: BookingQuery) {
    const { page, limit, status } = query;
    const filter = status
      ? { status: status as BookingStatus }
      : {};
    return bookingRepository.findAll(filter, page, limit);
  }

  // ── Admin — Update Booking Status ─────────────────────
  async updateStatus(id: string, status: BookingStatus) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    const updated = await bookingRepository.update(id, {
      status,
    });

    return {
      booking: updated,
      message: `Booking status updated to ${status}`,
    };
  }
}

export default new BookingService();