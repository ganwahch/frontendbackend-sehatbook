import { Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment";
import { DoctorProfile } from "../models/DoctorProfile";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";
import {
  CreateAppointmentInput,
  UpdateStatusInput,
} from "../validators/appointmentValidators";

const ACTIVE_STATUSES = ["Pending", "Confirmed", "Completed"];

/**
 * POST /api/appointments  (PATIENT)
 * Creates an appointment. Enforces the "no double booking" rule:
 * the same doctor cannot have two active appointments on the same
 * date + timeSlot.
 */
export const createAppointment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { doctorId, date, timeSlot, reason } =
      req.body as CreateAppointmentInput;

    if (!mongoose.isValidObjectId(doctorId)) {
      throw ApiError.badRequest("Invalid doctor id");
    }

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor || !doctor.isApproved) {
      throw ApiError.notFound("Doctor not available");
    }

    // Explicit double-booking check (friendly error before hitting the index)
    const clash = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $in: ACTIVE_STATUSES },
    });
    if (clash) {
      throw ApiError.conflict(
        "This time slot is already booked. Please choose another slot."
      );
    }

    try {
      const appointment = await Appointment.create({
        patientId: req.user!.id,
        doctorId,
        date,
        timeSlot,
        reason,
        status: "Pending",
        fee: doctor.fee,
      });

      res.status(201).json({
        success: true,
        message: "Appointment booked. Waiting for doctor confirmation.",
        appointment,
      });
    } catch (err) {
      // Safety net: unique index caught a race condition
      const anyErr = err as { code?: number };
      if (anyErr.code === 11000) {
        throw ApiError.conflict(
          "This time slot was just booked. Please choose another slot."
        );
      }
      throw err;
    }
  }
);

/**
 * GET /api/appointments  (any role)
 * Returns appointments scoped to the caller's role:
 *  - PATIENT: their own
 *  - DOCTOR:  booked with them
 *  - ADMIN:   all (supports ?search & ?status & pagination)
 */
export const getAppointments = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { role, id } = req.user!;
    const { status = "" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    if (role === "PATIENT") {
      filter.patientId = id;
    } else if (role === "DOCTOR") {
      const profile = await DoctorProfile.findOne({ userId: id });
      if (!profile) throw ApiError.notFound("Doctor profile not found");
      filter.doctorId = profile._id;
    }
    // ADMIN: no extra scoping

    const appointments = await Appointment.find(filter)
      .populate<{ patientId: { name: string; avatar?: string; phone?: string } }>(
        "patientId",
        "name avatar phone email"
      )
      .populate({
        path: "doctorId",
        select: "specialization fee userId",
        populate: { path: "userId", select: "name avatar" },
      })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, count: appointments.length, appointments });
  }
);

/**
 * GET /api/appointments/booked?doctorId=&date=
 * Public helper: returns the list of already-taken time slots so the
 * booking UI can disable them.
 */
export const getBookedSlots = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { doctorId, date } = req.query as Record<string, string>;
    if (!doctorId || !date) {
      throw ApiError.badRequest("doctorId and date are required");
    }
    const booked = await Appointment.find({
      doctorId,
      date,
      status: { $in: ACTIVE_STATUSES },
    }).select("timeSlot -_id");

    res.json({
      success: true,
      bookedSlots: booked.map((b) => b.timeSlot),
    });
  }
);

/**
 * PUT /api/appointments/:id/status
 * Role-based transitions:
 *  - DOCTOR: Confirm / Cancel (reject) / Complete their own appointments
 *  - PATIENT: Cancel their own (if not already Completed)
 *  - ADMIN: any transition
 */
export const updateAppointmentStatus = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as UpdateStatusInput;
    const { role, id: userId } = req.user!;

    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest("Invalid appointment id");
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) throw ApiError.notFound("Appointment not found");

    if (role === "PATIENT") {
      if (String(appointment.patientId) !== userId) {
        throw ApiError.forbidden("Not your appointment");
      }
      if (status !== "Cancelled") {
        throw ApiError.forbidden("Patients can only cancel appointments");
      }
      if (appointment.status === "Completed") {
        throw ApiError.badRequest("Completed appointments cannot be cancelled");
      }
    } else if (role === "DOCTOR") {
      const profile = await DoctorProfile.findOne({ userId });
      if (!profile || String(appointment.doctorId) !== String(profile._id)) {
        throw ApiError.forbidden("Not your appointment");
      }
    }
    // ADMIN: unrestricted

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${status.toLowerCase()}`,
      appointment,
    });
  }
);

/**
 * DELETE /api/appointments/:id
 * Patient cancels (soft) their own; admin can hard-delete.
 */
export const deleteAppointment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest("Invalid appointment id");
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) throw ApiError.notFound("Appointment not found");

    if (role === "ADMIN") {
      await appointment.deleteOne();
      res.json({ success: true, message: "Appointment deleted" });
      return;
    }

    // Patient: soft-cancel instead of deleting
    if (String(appointment.patientId) !== userId) {
      throw ApiError.forbidden("Not your appointment");
    }
    appointment.status = "Cancelled";
    await appointment.save();
    res.json({ success: true, message: "Appointment cancelled", appointment });
  }
);

/**
 * GET /api/appointments/doctor/stats  (DOCTOR)
 * Stats cards: total, today, earnings (completed), unique patients.
 */
export const getDoctorStats = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const profile = await DoctorProfile.findOne({ userId: req.user!.id });
    if (!profile) throw ApiError.notFound("Doctor profile not found");

    const today = new Date().toISOString().slice(0, 10);
    const doctorId = profile._id;

    const [total, todayCount, completed, patientIds] = await Promise.all([
      Appointment.countDocuments({ doctorId }),
      Appointment.countDocuments({ doctorId, date: today }),
      Appointment.find({ doctorId, status: "Completed" }).select("fee"),
      Appointment.distinct("patientId", { doctorId }),
    ]);

    const earnings = completed.reduce((sum, a) => sum + (a.fee ?? 0), 0);

    res.json({
      success: true,
      stats: {
        totalAppointments: total,
        today: todayCount,
        earnings,
        patients: patientIds.length,
      },
    });
  }
);
