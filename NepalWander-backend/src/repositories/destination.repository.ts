import mongoose from "mongoose";
import {
  DestinationModel,
  DestinationDocument,
  IDestination,
  DestinationRegion,
  DifficultyLevel,
} from "../models/Destination.model";

export interface DestinationFilter {
  region?: DestinationRegion;
  difficulty?: DifficultyLevel;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export class DestinationRepository {

  async create(
    data: Partial<IDestination>
  ): Promise<DestinationDocument> {
    return DestinationModel.create(data);
  }

  async findById(
    id: string
  ): Promise<DestinationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return DestinationModel.findById(id).populate(
      "createdBy",
      "firstName lastName email"
    );
  }

  async findBySlug(
    slug: string
  ): Promise<DestinationDocument | null> {
    return DestinationModel.findOne({ slug }).populate(
      "createdBy",
      "firstName lastName email"
    );
  }

  async findAll(
    filter: DestinationFilter = {},
    page = 1,
    limit = 10
  ): Promise<{
    destinations: DestinationDocument[];
    total: number;
    pages: number;
  }> {
    const query: Record<string, unknown> = {
      isActive: true,
    };

    if (filter.region) query.region = filter.region;
    if (filter.difficulty) query.difficulty = filter.difficulty;
    if (filter.isFeatured !== undefined)
      query.isFeatured = filter.isFeatured;

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        {
          description: {
            $regex: filter.search,
            $options: "i",
          },
        },
        {
          bestFor: {
            $regex: filter.search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await DestinationModel.countDocuments(query);
    const destinations = await DestinationModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ isFeatured: -1, createdAt: -1 });

    return {
      destinations,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<IDestination>
  ): Promise<DestinationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return DestinationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await DestinationModel.findByIdAndDelete(id);
    return !!result;
  }

  async findFeatured(): Promise<DestinationDocument[]> {
    return DestinationModel.find({
      isFeatured: true,
      isActive: true,
    }).limit(6);
  }
}