import mongoose from "mongoose";
import {
  BookingModel,
  BookingDocument,
  IBooking,
  BookingStatus,
} from "../models/Booking.model";

export class BookingRepository {

  async create(
    data: Partial<IBooking>
  ): Promise<BookingDocument> {
    return BookingModel.create(data);
  }

  async findById(
    id: string
  ): Promise<BookingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findById(id)
      .populate("user", "firstName lastName email phone")
      .populate(
        "package",
        "title duration price coverImage destination"
      );
  }

  async findByBookingNumber(
    bookingNumber: string
  ): Promise<BookingDocument | null> {
    return BookingModel.findOne({ bookingNumber })
      .populate("user", "firstName lastName email")
      .populate("package", "title duration price");
  }

  async findByUser(
    userId: string
  ): Promise<BookingDocument[]> {
    return BookingModel.find({ user: userId })
      .populate("package", "title duration price coverImage")
      .sort({ createdAt: -1 });
  }

  async findAll(
    filter: Partial<{ status: BookingStatus }> = {},
    page = 1,
    limit = 10
  ): Promise<{
    bookings: BookingDocument[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await BookingModel.countDocuments(filter);
    const bookings = await BookingModel.find(filter)
      .populate("user", "firstName lastName email")
      .populate("package", "title duration price")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      bookings,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<IBooking>
  ): Promise<BookingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async findByPackage(
    packageId: string
  ): Promise<BookingDocument[]> {
    return BookingModel.find({
      package: new mongoose.Types.ObjectId(packageId),
    }).populate("user", "firstName lastName email");
  }
}