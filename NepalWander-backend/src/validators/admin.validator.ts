import { z } from "zod";

export const createAdminSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .trim(),

  email: z
    .string()
    .email("Valid email is required")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must have uppercase, lowercase and a number"
    ),
});

export const rejectAccountSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a reason of at least 10 characters")
    .trim(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type RejectAccountInput = z.infer<typeof rejectAccountSchema>;