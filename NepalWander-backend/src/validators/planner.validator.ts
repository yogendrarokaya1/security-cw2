import { z } from "zod";

export const generatePlanSchema = z.object({
  budget: z.object({
    min: z.number().min(0, "Minimum budget must be positive"),
    max: z
      .number()
      .min(0, "Maximum budget must be positive"),
  }),

  duration: z
    .number()
    .min(1, "Duration must be at least 1 day")
    .max(30, "Duration cannot exceed 30 days"),

  groupSize: z
    .number()
    .min(1, "Group size must be at least 1")
    .max(50, "Group size cannot exceed 50"),

  interests: z
    .array(
      z.enum([
        "trekking",
        "cultural",
        "wildlife",
        "adventure",
        "spiritual",
        "photography",
        "culinary",
        "boating",
        "paragliding",
      ])
    )
    .min(1, "Select at least one interest"),

  fitnessLevel: z.enum(["easy", "moderate", "hard"], {
    message: "Fitness level must be easy, moderate or hard",
  }),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid start date"
    )
    .refine(
      (val) => new Date(val) > new Date(),
      "Start date must be in the future"
    ),

  region: z.string().optional(),
});

export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;