import { z } from "zod";

export const createReviewSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  rating: z.number().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().max(500).optional().default(""),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
