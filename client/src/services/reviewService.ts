import { api } from "./api";
import { Review } from "@/types";

export interface CreateReviewPayload {
  doctorId: string;
  rating: number;
  comment?: string;
}

export async function createReview(
  payload: CreateReviewPayload
): Promise<void> {
  await api.post("/reviews", payload);
}

export async function getDoctorReviews(doctorId: string): Promise<Review[]> {
  const { data } = await api.get<{ success: boolean; reviews: Review[] }>(
    `/reviews/${doctorId}`
  );
  return data.reviews;
}
