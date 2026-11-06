import { Response } from "express";
import mongoose from "mongoose";
import { DoctorProfile } from "../models/DoctorProfile";
import { Review } from "../models/Review";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";
import { UpdateDoctorProfileInput } from "../validators/doctorValidators";

/**
 * GET /api/doctors
 * Public listing with search (name), filters (specialization, city, maxFee)
 * and sorting (rating | fee | experience). Only approved doctors are shown.
 */
export const getDoctors = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    search = "",
    specialization = "",
    city = "",
    maxFee = "",
    sort = "rating",
  } = req.query as Record<string, string>;

  const match: Record<string, unknown> = { isApproved: true };
  if (specialization) match.specialization = specialization;
  if (maxFee) match.fee = { $lte: Number(maxFee) };

  const sortStage: Record<string, 1 | -1> =
    sort === "fee"
      ? { fee: 1 }
      : sort === "experience"
      ? { experience: -1 }
      : { rating: -1 };

  // Build user-level filters (name + city live on the User document)
  const userMatch: Record<string, unknown> = {};
  if (search) userMatch["user.name"] = { $regex: search, $options: "i" };
  if (city) userMatch["user.city"] = { $regex: `^${city}$`, $options: "i" };

  const doctors = await DoctorProfile.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: userMatch },
    {
      $project: {
        _id: 1,
        specialization: 1,
        experience: 1,
        fee: 1,
        bio: 1,
        education: 1,
        clinicAddress: 1,
        availableDays: 1,
        rating: 1,
        ratingCount: 1,
        name: "$user.name",
        city: "$user.city",
        avatar: "$user.avatar",
        email: "$user.email",
      },
    },
    { $sort: sortStage },
  ]);

  res.json({ success: true, count: doctors.length, doctors });
});

/**
 * GET /api/doctors/:id
 * Single doctor detail + their reviews (with reviewer name).
 */
export const getDoctorById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest("Invalid doctor id");
    }

    const result = await DoctorProfile.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          specialization: 1,
          experience: 1,
          fee: 1,
          bio: 1,
          education: 1,
          clinicAddress: 1,
          availableDays: 1,
          rating: 1,
          ratingCount: 1,
          isApproved: 1,
          name: "$user.name",
          city: "$user.city",
          avatar: "$user.avatar",
          email: "$user.email",
          phone: "$user.phone",
        },
      },
    ]);

    if (!result.length) {
      throw ApiError.notFound("Doctor not found");
    }

    const reviews = await Review.find({ doctorId: id })
      .populate<{ patientId: { name: string; avatar?: string } }>(
        "patientId",
        "name avatar"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedReviews = reviews.map((r) => ({
      id: String(r._id),
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      patientName: r.patientId?.name ?? "Patient",
      patientAvatar: r.patientId?.avatar ?? "",
    }));

    res.json({
      success: true,
      doctor: result[0],
      reviews: formattedReviews,
    });
  }
);

/**
 * GET /api/doctors/me/profile  (DOCTOR)
 * The logged-in doctor's own profile.
 */
export const getMyDoctorProfile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const profile = await DoctorProfile.findOne({ userId: req.user!.id });
    if (!profile) {
      throw ApiError.notFound("Doctor profile not found");
    }
    res.json({ success: true, profile });
  }
);

/**
 * PUT /api/doctors/me/profile  (DOCTOR)
 * Update own profile incl. weekly availability.
 */
export const updateMyDoctorProfile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as UpdateDoctorProfileInput;

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      throw ApiError.notFound("Doctor profile not found");
    }

    res.json({ success: true, message: "Profile updated", profile });
  }
);
