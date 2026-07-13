import mongoose from "mongoose";
import {
  PackageModel,
  PackageDocument,
  IPackage,
  PackageStatus,
} from "../models/Package.model";
import { DifficultyLevel } from "../models/Destination.model";

export interface PackageFilter {
  destination?: string;
  difficulty?: String;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  status?: PackageStatus;
  search?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

export class PackageRepository {

  async create(
    data: Partial<IPackage>
  ): Promise<PackageDocument> {
    return PackageModel.create(data);
  }

  async findById(
    id: string
  ): Promise<PackageDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PackageModel.findById(id)
      .populate("destination", "name region altitude coverImage")
      .populate("createdBy", "firstName lastName email");
  }

  async findBySlug(
    slug: string
  ): Promise<PackageDocument | null> {
    return PackageModel.findOne({ slug })
      .populate("destination", "name region altitude coverImage")
      .populate("createdBy", "firstName lastName email");
  }

  async findAll(
    filter: PackageFilter = {},
    page = 1,
    limit = 10
  ): Promise<{
    packages: PackageDocument[];
    total: number;
    pages: number;
  }> {
    const query: Record<string, unknown> = {
      status: PackageStatus.PUBLISHED,
    };

    if (filter.destination) {
      query.destination = new mongoose.Types.ObjectId(
        filter.destination
      );
    }
    if (filter.difficulty) query.difficulty = filter.difficulty;
    if (filter.isFeatured !== undefined)
      query.isFeatured = filter.isFeatured;
    if (filter.isBestSeller !== undefined)
      query.isBestSeller = filter.isBestSeller;

    if (filter.minPrice || filter.maxPrice) {
      query.price = {};
      if (filter.minPrice)
        (query.price as Record<string, number>).$gte =
          filter.minPrice;
      if (filter.maxPrice)
        (query.price as Record<string, number>).$lte =
          filter.maxPrice;
    }

    if (filter.duration) query.duration = filter.duration;

    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: "i" } },
        {
          description: {
            $regex: filter.search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await PackageModel.countDocuments(query);
    const packages = await PackageModel.find(query)
      .populate("destination", "name region altitude")
      .skip(skip)
      .limit(limit)
      .sort({ isBestSeller: -1, isFeatured: -1, createdAt: -1 });

    return { packages, total, pages: Math.ceil(total / limit) };
  }

  async update(
    id: string,
    data: Partial<IPackage>
  ): Promise<PackageDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PackageModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await PackageModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByDestination(
    destinationId: string
  ): Promise<PackageDocument[]> {
    return PackageModel.find({
      destination: new mongoose.Types.ObjectId(destinationId),
      status: PackageStatus.PUBLISHED,
    }).populate("destination", "name region");
  }

  async findFeatured(): Promise<PackageDocument[]> {
    return PackageModel.find({
      isFeatured: true,
      status: PackageStatus.PUBLISHED,
    })
      .populate("destination", "name region altitude")
      .limit(6);
  }
}