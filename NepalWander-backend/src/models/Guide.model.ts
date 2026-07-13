import mongoose, { Schema, HydratedDocument } from "mongoose";

export enum GuideSpecialty {
  TREKKING = "trekking",
  CULTURAL = "cultural",
  WILDLIFE = "wildlife",
  ADVENTURE = "adventure",
  SPIRITUAL = "spiritual",
  PHOTOGRAPHY = "photography",
  CULINARY = "culinary",
}

export enum GuideLanguage {
  NEPALI = "nepali",
  ENGLISH = "english",
  HINDI = "hindi",
  CHINESE = "chinese",
  JAPANESE = "japanese",
  GERMAN = "german",
  FRENCH = "french",
}

export interface ICertification {
  name: string;
  issuedBy: string;
  issuedYear: number;
  certificateNumber?: string;
}

export interface IReview {
  user: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IGuide {
  user: mongoose.Types.ObjectId;
  bio: string;
  specialties: GuideSpecialty[];
  languages: GuideLanguage[];
  experience: number;
  certifications: ICertification[];
  nmaCertNumber?: string;
  isNmaVerified: boolean;
  profileImage?: string;
  coverImage?: string;
  pricePerDay: number;
  regions: string[];
  reviews: IReview[];
  rating: number;
  reviewCount: number;
  totalTrips: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GuideDocument = HydratedDocument<IGuide>;

const CertificationSchema = new Schema<ICertification>({
  name: { type: String, required: true, trim: true },
  issuedBy: { type: String, required: true, trim: true },
  issuedYear: { type: Number, required: true },
  certificateNumber: { type: String, trim: true },
});

const ReviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
  createdAt: { type: Date, default: Date.now },
});

const GuideSchema = new Schema<IGuide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      minlength: 50,
      trim: true,
    },
    specialties: [
      {
        type: String,
        enum: Object.values(GuideSpecialty),
      },
    ],
    languages: [
      {
        type: String,
        enum: Object.values(GuideLanguage),
      },
    ],
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    certifications: [CertificationSchema],
    nmaCertNumber: { type: String, trim: true },
    isNmaVerified: { type: Boolean, default: false },
    profileImage: { type: String },
    coverImage: { type: String },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    regions: [{ type: String, trim: true }],
    reviews: [ReviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GuideModel = mongoose.model<IGuide>(
  "Guide",
  GuideSchema
);