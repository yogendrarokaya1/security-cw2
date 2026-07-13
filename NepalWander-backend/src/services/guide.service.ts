import { GuideRepository } from "../repositories/guide.repository";
import { BookingRepository } from "../repositories/booking.repository";
import {
  CreateGuideProfileInput,
  UpdateGuideProfileInput,
  AddReviewInput,
  GuideQuery,
} from "../validators/guide.validator";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../middlewares/error.middleware";
import {
  IGuide,
  GuideSpecialty,
  GuideLanguage,
  ICertification,
} from "../models/Guide.model";
import { BookingStatus } from "../models/Booking.model";
import mongoose from "mongoose";

const guideRepository = new GuideRepository();
const bookingRepository = new BookingRepository();

class GuideService {

  // ── Create Guide Profile ──────────────────────────────
  async createProfile(
    input: CreateGuideProfileInput,
    userId: string
  ) {
    // Check if guide profile already exists
    const existing =
      await guideRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError(
        "Guide profile already exists"
      );
    }

    const data: Partial<IGuide> = {
      user: userId as any,
      bio: input.bio,
      specialties: input.specialties as GuideSpecialty[],
      languages: input.languages as GuideLanguage[],
      experience: input.experience,
      certifications:
        input.certifications as ICertification[],
      nmaCertNumber: input.nmaCertNumber,
      pricePerDay: input.pricePerDay,
      regions: input.regions,
      isNmaVerified: false,
      isAvailable: true,
      isActive: true,
    };

    return guideRepository.create(data);
  }

  async adminCreateProfile(
  input: CreateGuideProfileInput & { userId: string }
) {
  const existing = await guideRepository.findByUserId(input.userId);
  if (existing) {
    throw new ConflictError("Guide profile already exists for this user");
  }
 
  const data: Partial<IGuide> = {
    user: input.userId as any,
    bio: input.bio,
    specialties: input.specialties as GuideSpecialty[],
    languages: input.languages as GuideLanguage[],
    experience: input.experience,
    certifications: input.certifications as ICertification[],
    nmaCertNumber: input.nmaCertNumber,
    pricePerDay: input.pricePerDay,
    regions: input.regions,
    isNmaVerified: false,
    isAvailable: true,
    isActive: true,
  };
 
  return guideRepository.create(data);
}

  // ── Get All Guides ────────────────────────────────────
  async getAll(query: GuideQuery) {
    const { page, limit, ...filter } = query;
    return guideRepository.findAll(filter, page, limit);
  }

  // ── Get By ID ─────────────────────────────────────────
  async getById(id: string) {
    const guide = await guideRepository.findById(id);
    if (!guide) throw new NotFoundError("Guide not found");
    return guide;
  }

  // ── Get My Profile ────────────────────────────────────
  async getMyProfile(userId: string) {
    const guide =
      await guideRepository.findByUserId(userId);
    if (!guide) {
      throw new NotFoundError("Guide profile not found");
    }
    return guide;
  }

  // ── Update Profile ────────────────────────────────────
  async updateProfile(
    userId: string,
    input: UpdateGuideProfileInput
  ) {
    const guide =
      await guideRepository.findByUserId(userId);
    if (!guide) {
      throw new NotFoundError("Guide profile not found");
    }

    const data: Partial<IGuide> = {
      ...input,
      specialties: input.specialties as
        | GuideSpecialty[]
        | undefined,
      languages: input.languages as
        | GuideLanguage[]
        | undefined,
      certifications: input.certifications as
        | ICertification[]
        | undefined,
    };

    return guideRepository.update(
      guide._id.toString(),
      data
    );
  }

  // ── Add Review ────────────────────────────────────────
  async addReview(
    input: AddReviewInput,
    userId: string
  ) {
    // Check guide exists
    const guide = await guideRepository.findById(
      input.guideId
    );
    if (!guide) throw new NotFoundError("Guide not found");

    // Check booking exists and is completed
    const booking = await bookingRepository.findById(
      input.bookingId
    );
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    // Only completed bookings can be reviewed
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestError(
        "You can only review after completing a trip"
      );
    }

    // Check booking belongs to user
    if (booking.user._id.toString() !== userId) {
      throw new BadRequestError(
        "You can only review your own bookings"
      );
    }

    // Check not already reviewed
    const alreadyReviewed = guide.reviews.some(
      (r) => r.booking.toString() === input.bookingId
    );
    if (alreadyReviewed) {
      throw new ConflictError(
        "You have already reviewed this trip"
      );
    }

    const review = {
      user: new mongoose.Types.ObjectId(userId),
      booking: new mongoose.Types.ObjectId(
        input.bookingId
      ),
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date(),
    };

    return guideRepository.addReview(
      input.guideId,
      review
    );
  }

  // ── Toggle Availability ───────────────────────────────
  async toggleAvailability(userId: string) {
    const guide =
      await guideRepository.findByUserId(userId);
    if (!guide) {
      throw new NotFoundError("Guide profile not found");
    }

    const updated = await guideRepository.update(
      guide._id.toString(),
      { isAvailable: !guide.isAvailable }
    );

    return {
      guide: updated,
      message: `You are now ${updated?.isAvailable ? "available" : "unavailable"} for bookings`,
    };
  }

  // ── Admin — Verify NMA ────────────────────────────────
  async verifyNma(guideId: string) {
    const guide = await guideRepository.findById(guideId);
    if (!guide) throw new NotFoundError("Guide not found");

    const updated = await guideRepository.update(
      guideId,
      { isNmaVerified: true }
    );

    return {
      guide: updated,
      message: "Guide NMA certification verified",
    };
  }

  // ── Admin — Toggle Guide Status ───────────────────────
  async toggleStatus(guideId: string) {
    const guide = await guideRepository.findById(guideId);
    if (!guide) throw new NotFoundError("Guide not found");

    const updated = await guideRepository.update(
      guideId,
      { isActive: !guide.isActive }
    );

    return {
      guide: updated,
      message: `Guide ${updated?.isActive ? "activated" : "deactivated"} successfully`,
    };
  }

  
}

export default new GuideService();