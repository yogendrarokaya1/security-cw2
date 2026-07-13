import mongoose, { Schema, HydratedDocument } from "mongoose";

export enum DestinationRegion {
  HIMALAYA = "himalaya",
  TERAI = "terai",
  POKHARA = "pokhara",
  KATHMANDU = "kathmandu",
  MUSTANG = "mustang",
  EASTERN = "eastern",
}

export enum DifficultyLevel {
  EASY = "easy",
  MODERATE = "moderate",
  HARD = "hard",
  EXTREME = "extreme",
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  EXTREME = "extreme",
}

export interface ISeason {
  month: string;
  status: "best" | "shoulder" | "avoid";
}

export interface ISafetyInfo {
  riskLevel: RiskLevel;
  nearestHospital: string;
  emergencyContact: string;
  rescueService: string;
  timsRequired: boolean;
  timsCheckpoint?: string;
}

export interface IDestination {
  name: string;
  slug: string;
  description: string;
  region: DestinationRegion;
  altitude: number;
  difficulty: DifficultyLevel;
  images: string[];
  coverImage: string;
  location: {
    latitude: number;
    longitude: number;
  };
  seasonalCalendar: ISeason[];
  safetyInfo: ISafetyInfo;
  localTips: string[];
  bestFor: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DestinationDocument = HydratedDocument<IDestination>;

const SeasonSchema = new Schema<ISeason>({
  month: { type: String, required: true },
  status: {
    type: String,
    enum: ["best", "shoulder", "avoid"],
    required: true,
  },
});

const SafetySchema = new Schema<ISafetyInfo>({
  riskLevel: {
    type: String,
    enum: Object.values(RiskLevel),
    required: true,
  },
  nearestHospital: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  rescueService: { type: String, required: true },
  timsRequired: { type: Boolean, default: false },
  timsCheckpoint: { type: String },
});

const DestinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
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
    region: {
      type: String,
      enum: Object.values(DestinationRegion),
      required: [true, "Region is required"],
    },
    altitude: {
      type: Number,
      required: [true, "Altitude is required"],
    },
    difficulty: {
      type: String,
      enum: Object.values(DifficultyLevel),
      required: [true, "Difficulty is required"],
    },
    images: [{ type: String }],
    coverImage: { type: String, default: "" },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    seasonalCalendar: [SeasonSchema],
    safetyInfo: { type: SafetySchema, required: true },
    localTips: [{ type: String }],
    bestFor: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto generate slug from name
DestinationSchema.pre("validate", function(this: DestinationDocument) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

export const DestinationModel = mongoose.model<IDestination>(
  "Destination",
  DestinationSchema
);