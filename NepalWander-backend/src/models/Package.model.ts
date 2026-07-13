import mongoose, { Schema, HydratedDocument } from "mongoose";
import { DifficultyLevel } from "./Destination.model";

export enum PackageStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface IDayItinerary {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
  distance?: number;
}

export interface ICostBreakdown {
  transport: number;
  accommodation: number;
  meals: number;
  guide: number;
  permits: number;
  other: number;
}

export interface IPackage {
  title: string;
  slug: string;
  description: string;
  destination: mongoose.Types.ObjectId;
  duration: number;
  groupSize: {
    min: number;
    max: number;
  };
  difficulty: DifficultyLevel;
  price: number;
  costBreakdown: ICostBreakdown;
  itinerary: IDayItinerary[];
  includes: string[];
  excludes: string[];
  images: string[];
  coverImage: string;
  status: PackageStatus;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  ecoScore: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PackageDocument = HydratedDocument<IPackage>;

const ItinerarySchema = new Schema<IDayItinerary>({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  accommodation: { type: String },
  meals: { type: String },
  distance: { type: Number },
});

const CostSchema = new Schema<ICostBreakdown>({
  transport: { type: Number, required: true, default: 0 },
  accommodation: { type: Number, required: true, default: 0 },
  meals: { type: Number, required: true, default: 0 },
  guide: { type: Number, required: true, default: 0 },
  permits: { type: Number, required: true, default: 0 },
  other: { type: Number, default: 0 },
});

const PackageSchema = new Schema<IPackage>(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: 20,
    },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
    },
    groupSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 12 },
    },
    difficulty: {
      type: String,
      enum: Object.values(DifficultyLevel),
      required: [true, "Difficulty is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    costBreakdown: {
      type: CostSchema,
      required: true,
    },
    itinerary: [ItinerarySchema],
    includes: [{ type: String }],
    excludes: [{ type: String }],
    images: [{ type: String }],
    coverImage: { type: String, default: "" },
    status: {
      type: String,
      enum: Object.values(PackageStatus),
      default: PackageStatus.DRAFT,
    },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    ecoScore: { type: Number, default: 0, min: 0, max: 5 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto generate slug from title
PackageSchema.pre("validate", function(this: PackageDocument) {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

// Virtual — total price from cost breakdown
PackageSchema.virtual("totalFromBreakdown").get(function () {
  const c = this.costBreakdown;
  return (
    c.transport +
    c.accommodation +
    c.meals +
    c.guide +
    c.permits +
    c.other
  );
});

export const PackageModel = mongoose.model<IPackage>(
  "Package",
  PackageSchema
);