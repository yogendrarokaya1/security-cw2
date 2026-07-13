import { z } from "zod";
import {
  GuideSpecialty,
  GuideLanguage,
} from "../models/Guide.model";

const certificationSchema = z.object({
  name: z
    .string()
    .min(2, "Certification name is required")
    .trim(),
  issuedBy: z
    .string()
    .min(2, "Issuing organization is required")
    .trim(),
  issuedYear: z
    .number()
    .min(1990, "Invalid year")
    .max(
      new Date().getFullYear(),
      "Year cannot be in the future"
    ),
  certificateNumber: z.string().trim().optional(),
});

export const createGuideProfileSchema = z.object({
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .trim(),

  specialties: z
    .array(
      z.enum(
        Object.values(GuideSpecialty) as [
          string,
          ...string[],
        ]
      )
    )
    .min(1, "At least one specialty is required"),

  languages: z
    .array(
      z.enum(
        Object.values(GuideLanguage) as [
          string,
          ...string[],
        ]
      )
    )
    .min(1, "At least one language is required"),

  experience: z
    .number()
    .min(0, "Experience must be positive"),

  certifications: z
    .array(certificationSchema)
    .optional()
    .default([]),

  nmaCertNumber: z.string().trim().optional(),

  pricePerDay: z
    .number()
    .min(0, "Price must be positive"),

  regions: z
    .array(z.string().trim())
    .min(1, "At least one region is required"),
});

export const updateGuideProfileSchema =
  createGuideProfileSchema.partial();

export const addReviewSchema = z.object({
  guideId: z.string().min(1, "Guide ID is required"),

  bookingId: z
    .string()
    .min(1, "Booking ID is required"),

  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .trim(),
});

export const guideQuerySchema = z.object({
  specialty: z.string().optional(),
  language: z.string().optional(),
  region: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  isNmaVerified: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val === "true"
    ),
  isAvailable: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val === "true"
    ),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
});

// Add to guide.validator.ts:

export const adminCreateGuideProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  bio: z.string().min(50, "Bio must be at least 50 characters").trim(),
  specialties: z
    .array(z.enum(Object.values(GuideSpecialty) as [string, ...string[]]))
    .min(1, "At least one specialty is required"),
  languages: z
    .array(z.enum(Object.values(GuideLanguage) as [string, ...string[]]))
    .min(1, "At least one language is required"),
  experience: z.number().min(0),
  certifications: z.array(z.object({
    name: z.string().min(2).trim(),
    issuedBy: z.string().min(2).trim(),
    issuedYear: z.number().min(1990).max(new Date().getFullYear()),
    certificateNumber: z.string().trim().optional(),
  })).optional().default([]),
  nmaCertNumber: z.string().trim().optional(),
  pricePerDay: z.number().min(0),
  regions: z.array(z.string().trim()).min(1, "At least one region is required"),
});

export type AdminCreateGuideProfileInput = z.infer<typeof adminCreateGuideProfileSchema>;

export type CreateGuideProfileInput = z.infer<typeof createGuideProfileSchema>;
export type UpdateGuideProfileInput = z.infer<typeof updateGuideProfileSchema>;
export type AddReviewInput = z.infer<typeof addReviewSchema>;
export type GuideQuery = z.infer<typeof guideQuerySchema>;