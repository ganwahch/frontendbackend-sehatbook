import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDoctorProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  specialization: string;
  experience: number;
  fee: number;
  bio: string;
  education: string;
  clinicAddress: string;
  availableDays: string[];
  rating: number;
  ratingCount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0, default: 0 },
    fee: { type: Number, required: true, min: 0, default: 0 },
    bio: { type: String, default: "" },
    education: { type: String, default: "" },
    clinicAddress: { type: String, default: "" },
    availableDays: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DoctorProfile: Model<IDoctorProfile> =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfile>("DoctorProfile", doctorProfileSchema);
