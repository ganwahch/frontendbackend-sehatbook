import { z } from "zod";

// Update the logged-in doctor's own profile
export const updateDoctorProfileSchema = z.object({
  specialization: z.string().min(2).optional(),
  experience: z.number().min(0).optional(),
  fee: z.number().min(0).optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  clinicAddress: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
});

export type UpdateDoctorProfileInput = z.infer<
  typeof updateDoctorProfileSchema
>;
