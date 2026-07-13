import mongoose from "mongoose";
import {
  GuideModel,
  GuideDocument,
  IGuide,
  IReview,
  GuideSpecialty,
  GuideLanguage,
} from "../models/Guide.model";

export interface GuideFilter {
  specialty?: string;
  language?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  isNmaVerified?: boolean;
  isAvailable?: boolean;
  search?: string;
}

export class GuideRepository {

  async create(
    data: Partial<IGuide>
  ): Promise<GuideDocument> {
    return GuideModel.create(data);
  }

  async findById(
    id: string
  ): Promise<GuideDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return GuideModel.findById(id)
      .populate(
        "user",
        "firstName lastName email profileImage"
      )
      .populate("reviews.user", "firstName lastName");
  }

  async findByUserId(
    userId: string
  ): Promise<GuideDocument | null> {
    return GuideModel.findOne({ user: userId }).populate(
      "user",
      "firstName lastName email"
    );
  }

  async findAll(
    filter: GuideFilter = {},
    page = 1,
    limit = 10
  ): Promise<{
    guides: GuideDocument[];
    total: number;
    pages: number;
  }> {
    const query: Record<string, unknown> = {
      isActive: true,
    };

    if (filter.specialty) {
      query.specialties = filter.specialty;
    }
    if (filter.language) {
      query.languages = filter.language;
    }
    if (filter.region) {
      query.regions = {
        $regex: filter.region,
        $options: "i",
      };
    }
    if (filter.isNmaVerified !== undefined) {
      query.isNmaVerified = filter.isNmaVerified;
    }
    if (filter.isAvailable !== undefined) {
      query.isAvailable = filter.isAvailable;
    }

    if (filter.minPrice || filter.maxPrice) {
      query.pricePerDay = {};
      if (filter.minPrice) {
        (query.pricePerDay as Record<string, number>).$gte =
          filter.minPrice;
      }
      if (filter.maxPrice) {
        (query.pricePerDay as Record<string, number>).$lte =
          filter.maxPrice;
      }
    }

    if (filter.search) {
      query.$or = [
        { bio: { $regex: filter.search, $options: "i" } },
        {
          regions: {
            $regex: filter.search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await GuideModel.countDocuments(query);
    const guides = await GuideModel.find(query)
      .populate("user", "firstName lastName profileImage")
      .skip(skip)
      .limit(limit)
      .sort({ isNmaVerified: -1, rating: -1 });

    return {
      guides,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<IGuide>
  ): Promise<GuideDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return GuideModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).populate("user", "firstName lastName email");
  }

  async addReview(
    guideId: string,
    review: IReview
  ): Promise<GuideDocument | null> {
    const guide = await GuideModel.findByIdAndUpdate(
      guideId,
      { $push: { reviews: review } },
      { new: true }
    );

    if (guide) {
      // Recalculate average rating
      const total = guide.reviews.reduce(
        (sum, r) => sum + r.rating,
        0
      );
      const avg = total / guide.reviews.length;
      await GuideModel.findByIdAndUpdate(guideId, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: guide.reviews.length,
      });
    }

    return guide;
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await GuideModel.findByIdAndDelete(id);
    return !!result;
  }
}