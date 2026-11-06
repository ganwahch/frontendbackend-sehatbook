import { Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { DoctorProfile } from "../models/DoctorProfile";
import { Appointment } from "../models/Appointment";
import { Review } from "../models/Review";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

/**
 * GET /api/admin/stats
 * Top-line counts + revenue + "appointments per day (last 7 days)" chart data.
 */
export const getStats = catchAsync(async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalDoctors, totalAppointments, completed] =
    await Promise.all([
      User.countDocuments(),
      DoctorProfile.countDocuments(),
      Appointment.countDocuments(),
      Appointment.find({ status: "Completed" }).select("fee"),
    ]);

  const revenue = completed.reduce((sum, a) => sum + (a.fee ?? 0), 0);

  // Build last-7-days series keyed by YYYY-MM-DD (dates stored as strings)
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const grouped = await Appointment.aggregate([
    { $match: { date: { $gte: days[0] } } },
    { $group: { _id: "$date", count: { $sum: 1 } } },
  ]);
  const countByDate = new Map<string, number>(
    grouped.map((g) => [g._id as string, g.count as number])
  );

  const appointmentsPerWeek = days.map((date) => ({
    date,
    label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    count: countByDate.get(date) ?? 0,
  }));

  // Status breakdown (handy for a pie/donut)
  const statusAgg = await Appointment.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const statusBreakdown = statusAgg.map((s) => ({
    status: s._id as string,
    count: s.count as number,
  }));

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalDoctors,
      totalAppointments,
      revenue,
    },
    appointmentsPerWeek,
    statusBreakdown,
  });
});

/**
 * GET /api/admin/users?search=&page=&limit=&role=
 */
export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    search = "",
    role = "",
    page = "1",
    limit = "10",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * DELETE /api/admin/users/:id  — also cleans up linked doctor data.
 */
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest("Invalid id");

  if (id === req.user!.id) {
    throw ApiError.badRequest("You cannot delete your own account");
  }

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  if (user.role === "DOCTOR") {
    const profile = await DoctorProfile.findOne({ userId: user._id });
    if (profile) {
      await Promise.all([
        Appointment.deleteMany({ doctorId: profile._id }),
        Review.deleteMany({ doctorId: profile._id }),
        profile.deleteOne(),
      ]);
    }
  } else {
    await Appointment.deleteMany({ patientId: user._id });
    await Review.deleteMany({ patientId: user._id });
  }

  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

/**
 * GET /api/admin/doctors?search=&approved=
 * All doctors (approved + pending) with their user info.
 */
export const getAdminDoctors = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { search = "", approved = "" } = req.query as Record<string, string>;

    const match: Record<string, unknown> = {};
    if (approved === "true") match.isApproved = true;
    if (approved === "false") match.isApproved = false;

    const userMatch: Record<string, unknown> = {};
    if (search) userMatch["user.name"] = { $regex: search, $options: "i" };

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
          rating: 1,
          isApproved: 1,
          name: "$user.name",
          email: "$user.email",
          city: "$user.city",
          avatar: "$user.avatar",
        },
      },
      { $sort: { isApproved: 1, createdAt: -1 } },
    ]);

    res.json({ success: true, count: doctors.length, doctors });
  }
);

/**
 * PUT /api/admin/doctors/:id/approve   — toggle / set approval.
 */
export const setDoctorApproval = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isApproved } = req.body as { isApproved?: boolean };
    if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest("Invalid id");

    const profile = await DoctorProfile.findById(id);
    if (!profile) throw ApiError.notFound("Doctor not found");

    profile.isApproved =
      typeof isApproved === "boolean" ? isApproved : !profile.isApproved;
    await profile.save();

    res.json({
      success: true,
      message: profile.isApproved ? "Doctor approved" : "Doctor unapproved",
      profile,
    });
  }
);

/**
 * DELETE /api/admin/doctors/:id — remove doctor profile + user + data.
 */
export const deleteDoctor = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest("Invalid id");

    const profile = await DoctorProfile.findById(id);
    if (!profile) throw ApiError.notFound("Doctor not found");

    await Promise.all([
      Appointment.deleteMany({ doctorId: profile._id }),
      Review.deleteMany({ doctorId: profile._id }),
      User.findByIdAndDelete(profile.userId),
    ]);
    await profile.deleteOne();

    res.json({ success: true, message: "Doctor deleted" });
  }
);

/**
 * GET /api/admin/appointments?search=&status=&page=&limit=
 * Full appointments table with search (by patient/doctor name) + pagination.
 */
export const getAdminAppointments = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const {
      search = "",
      status = "",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const pipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: "users",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorProfile",
        },
      },
      { $unwind: "$doctorProfile" },
      {
        $lookup: {
          from: "users",
          localField: "doctorProfile.userId",
          foreignField: "_id",
          as: "doctorUser",
        },
      },
      { $unwind: "$doctorUser" },
    ];

    const matchStage: Record<string, unknown> = {};
    if (status) matchStage.status = status;
    if (search) {
      matchStage.$or = [
        { "patient.name": { $regex: search, $options: "i" } },
        { "doctorUser.name": { $regex: search, $options: "i" } },
      ];
    }
    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

    pipeline.push(
      {
        $project: {
          _id: 1,
          date: 1,
          timeSlot: 1,
          reason: 1,
          status: 1,
          fee: 1,
          createdAt: 1,
          patientName: "$patient.name",
          patientEmail: "$patient.email",
          doctorName: "$doctorUser.name",
          specialization: "$doctorProfile.specialization",
        },
      },
      { $sort: { createdAt: -1 } }
    );

    const countPipeline = [...pipeline, { $count: "total" }];
    pipeline.push(
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum }
    );

    const [appointments, countResult] = await Promise.all([
      Appointment.aggregate(pipeline),
      Appointment.aggregate(countPipeline),
    ]);

    const total = countResult.length ? countResult[0].total : 0;

    res.json({
      success: true,
      appointments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);
