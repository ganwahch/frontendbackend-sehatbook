import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT"]).default("PATIENT"),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal("")),

  // Doctor-only fields (required when role === "DOCTOR", enforced in controller)
  specialization: z.string().optional(),
  experience: z.number().min(0).optional(),
  fee: z.number().min(0).optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  clinicAddress: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
