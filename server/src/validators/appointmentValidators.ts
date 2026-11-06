import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z.string().min(3, "Please describe the reason (min 3 chars)"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled"]),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
