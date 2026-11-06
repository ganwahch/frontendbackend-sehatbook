import mongoose, { Document, Schema, Model } from "mongoose";
import { AppointmentStatus } from "../types";

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId; // references DoctorProfile
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  reason: string;
  status: AppointmentStatus;
  fee: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    date: { type: String, required: true }, // stored as YYYY-MM-DD
    timeSlot: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    fee: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

/**
 * Prevent double booking: the same doctor cannot have two ACTIVE appointments
 * at the same date + timeSlot. Cancelled appointments free the slot again,
 * which is why the partial filter excludes "Cancelled".
 */
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["Pending", "Confirmed", "Completed"] },
    },
  }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);
