import { z } from "zod";
import { DifficultyLevel } from "../models/Destination.model";
import { PackageStatus } from "../models/Package.model";

const itinerarySchema = z.object({
  day: z.number().min(1, "Day must be at least 1"),
  title: z.string().min(3, "Title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  distance: z.number().optional(),
});

const costSchema = z.object({
  transport: z.number().min(0).default(0),
  accommodation: z.number().min(0).default(0),
  meals: z.number().min(0).default(0),
  guide: z.number().min(0).default(0),
  permits: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
});

// ── Boolean field that accepts both boolean and string ─
const booleanField = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return false;
    if (typeof val === "boolean") return val;
    return val === "true";
  });

export const createPackageSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .trim(),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .trim(),

  destination: z
    .string()
    .min(1, "Destination ID is required"),

  duration: z
    .number()
    .min(1, "Duration must be at least 1 day"),

  groupSize: z
    .object({
      min: z.number().min(1).default(1),
      max: z.number().min(1).default(12),
    })
    .optional()
    .default({ min: 1, max: 12 }),

  difficulty: z.enum(
    Object.values(DifficultyLevel) as [string, ...string[]]
  ),

  price: z.number().min(0, "Price must be positive"),

  costBreakdown: costSchema,

  itinerary: z
    .array(itinerarySchema)
    .min(1, "At least one day itinerary is required"),

  includes: z.array(z.string()).optional().default([]),

  excludes: z.array(z.string()).optional().default([]),

  status: z
    .enum(
      Object.values(PackageStatus) as [string, ...string[]]
    )
    .optional()
    .default(PackageStatus.DRAFT),

  isFeatured: booleanField,
  isBestSeller: booleanField,
  coverImage: z.string().optional().default(""),

  images: z.array(z.string()).optional().default([]),

  ecoScore: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .default(0),
});

export const updatePackageSchema =
  createPackageSchema.partial();

// ── Query schema — separate from body schema ──────────
// isFeatured/isBestSeller here come from URL query params
// so they're always strings and need different handling
export const packageQuerySchema = z.object({
  destination: z.string().optional(),

  difficulty: z
    .enum(
      Object.values(DifficultyLevel) as [string, ...string[]]
    )
    .optional(),

  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  duration: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  search: z.string().optional(),

  isFeatured: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "undefined") return undefined;
      return val === "true" ? true : undefined;
    }),

  isBestSeller: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "undefined") return undefined;
      return val === "true" ? true : undefined;
    }),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageQuery = z.infer<typeof packageQuerySchema>;