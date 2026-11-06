import { Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review";
import { Appointment } from "../models/Appointment";
import { DoctorProfile } from "../models/DoctorProfile";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";
import { CreateReviewInput } from "../validators/reviewValidators";

/**
 * Recomputes a doctor's average rating + count from all their reviews.
 */
async function recalcDoctorRating(doctorId: string): Promise<void> {
  const agg = await Review.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: "$doctorId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = agg.length ? Math.round(agg[0].avg * 10) / 10 : 0;
  const count = agg.length ? agg[0].count : 0;

  await DoctorProfile.findByIdAndUpdate(doctorId, {
    rating: avg,
    ratingCount: count,
  });
}

/**
 * POST /api/reviews  (PATIENT)
 * Allowed only if the patient has a COMPLETED appointment with the doctor,
 * and only one review per doctor per patient.
 */
export const createReview = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { doctorId, rating, comment } = req.body as CreateReviewInput;
    const patientId = req.user!.id;

    if (!mongoose.isValidObjectId(doctorId)) {
      throw ApiError.badRequest("Invalid doctor id");
    }

    const completed = await Appointment.findOne({
      doctorId,
      patientId,
      status: "Completed",
    });
    if (!completed) {
      throw ApiError.forbidden(
        "You can only review a doctor after a completed appointment"
      );
    }

    const already = await Review.findOne({ doctorId, patientId });
    if (already) {
      throw ApiError.conflict("You have already reviewed this doctor");
    }

    const review = await Review.create({ doctorId, patientId, rating, comment });
    await recalcDoctorRating(doctorId);

    res.status(201).json({
      success: true,
      message: "Review added",
      review,
    });
  }
);

/**
 * GET /api/reviews/:doctorId  (public)
 */
export const getDoctorReviews = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { doctorId } = req.params;
    if (!mongoose.isValidObjectId(doctorId)) {
      throw ApiError.badRequest("Invalid doctor id");
    }

    const reviews = await Review.find({ doctorId })
      .populate<{ patientId: { name: string; avatar?: string } }>(
        "patientId",
        "name avatar"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reviews: reviews.map((r) => ({
        id: String(r._id),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        patientName: r.patientId?.name ?? "Patient",
        patientAvatar: r.patientId?.avatar ?? "",
      })),
    });
  }
);
