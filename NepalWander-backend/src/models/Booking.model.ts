import mongoose, { Schema, HydratedDocument } from "mongoose";

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  REFUNDED = "refunded",
  FAILED = "failed",
}

export enum PaymentMethod {
  ESEWA = "esewa",
  KHALTI = "khalti",
  BANK = "bank",
  CARD = "card",
}

export interface ITraveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber?: string;
}

export interface IPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  paidAt?: Date;
}

export interface IBooking {
  bookingNumber: string;
  user: mongoose.Types.ObjectId;
  package: mongoose.Types.ObjectId;
  travelers: ITraveler[];
  groupSize: number;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  specialRequests?: string;
  status: BookingStatus;
  payment: IPayment;
  cancelReason?: string;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

const TravelerSchema = new Schema<ITraveler>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  nationality: { type: String, required: true, trim: true },
  passportNumber: { type: String, trim: true },
});

const PaymentSchema = new Schema<IPayment>({
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.UNPAID,
  },
  amount: { type: Number, required: true },
  transactionId: { type: String },
  paidAt: { type: Date },
});

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    travelers: {
      type: [TravelerSchema],
      required: true,
    },
    groupSize: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    specialRequests: { type: String },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    cancelReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export const BookingModel = mongoose.model<IBooking>(
  "Booking",
  BookingSchema
);