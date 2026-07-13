import { z } from "zod";
import {
  DestinationRegion,
  DifficultyLevel,
  RiskLevel,
} from "../models/Destination.model";

const seasonSchema = z.object({
  month: z.string().min(1, "Month is required"),
  status: z.enum(["best", "shoulder", "avoid"]),
});

const safetySchema = z.object({
  riskLevel: z.enum(
    Object.values(RiskLevel) as [string, ...string[]]
  ),
  nearestHospital: z
    .string()
    .min(3, "Hospital name is required"),
  emergencyContact: z
    .string()
    .min(3, "Emergency contact is required"),
  rescueService: z
    .string()
    .min(3, "Rescue service is required"),
  timsRequired: z.boolean().default(false),
  timsCheckpoint: z.string().optional(),
});

export const createDestinationSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .trim(),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .trim(),

  region: z.enum(
    Object.values(DestinationRegion) as [string, ...string[]]
  ),

  altitude: z.number().min(0, "Altitude must be positive"),

  difficulty: z.enum(
    Object.values(DifficultyLevel) as [string, ...string[]]
  ),

  location: z.object({
    latitude: z.number().min(-90).max(90, "Invalid latitude"),
    longitude: z
      .number()
      .min(-180)
      .max(180, "Invalid longitude"),
  }),

  seasonalCalendar: z
    .array(seasonSchema)
    .min(12, "All 12 months required")
    .max(12, "Only 12 months allowed"),

  safetyInfo: safetySchema,

  localTips: z.array(z.string()).optional().default([]),

  bestFor: z.array(z.string()).optional().default([]),

  isFeatured: z.boolean().optional().default(false),

  coverImage: z.string().optional().default(""),

  images: z.array(z.string()).optional().default([]),
});

export const updateDestinationSchema =
  createDestinationSchema.partial();

// ── Zod v4 compatible query schema ───────────────────
export const destinationQuerySchema = z.object({
  region: z
    .enum(
      Object.values(DestinationRegion) as [string, ...string[]]
    )
    .optional(),

  difficulty: z
    .enum(
      Object.values(DifficultyLevel) as [string, ...string[]]
    )
    .optional(),

  search: z.string().optional(),



  isFeatured: z
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

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
export type DestinationQuery = z.infer<typeof destinationQuerySchema>;
