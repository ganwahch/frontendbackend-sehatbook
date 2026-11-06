import { Response } from "express";
import { User } from "../models/User";
import { DoctorProfile } from "../models/DoctorProfile";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../types";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../validators/authValidators";

function publicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  avatar?: string;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    city: user.city ?? "",
    avatar: user.avatar ?? "",
  };
}

// POST /api/auth/register
export const register = catchAsync(async (req: AuthRequest, res: Response) => {
  const body = req.body as RegisterInput;

  const existing = await User.findOne({ email: body.email });
  if (existing) {
    throw ApiError.conflict("Email is already registered");
  }

  const user = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    phone: body.phone,
    city: body.city,
    avatar: body.avatar,
  });

  // If registering as a doctor, create the linked doctor profile.
  if (body.role === "DOCTOR") {
    if (!body.specialization) {
      // Roll back the user so we don't leave a doctor without a profile.
      await User.findByIdAndDelete(user._id);
      throw ApiError.badRequest("Specialization is required for doctors");
    }
    await DoctorProfile.create({
      userId: user._id,
      specialization: body.specialization,
      experience: body.experience ?? 0,
      fee: body.fee ?? 0,
      bio: body.bio ?? "",
      education: body.education ?? "",
      clinicAddress: body.clinicAddress ?? "",
      availableDays: body.availableDays ?? [],
      isApproved: false, // admin must approve before the doctor is public
    });
  }

  const token = signToken({ id: String(user._id), role: user.role });

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    token,
    user: publicUser(user),
  });
});

// POST /api/auth/login
export const login = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ id: String(user._id), role: user.role });

  res.json({
    success: true,
    message: "Logged in successfully",
    token,
    user: publicUser(user),
  });
});

// GET /api/auth/me
export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  let doctorProfile = null;
  if (user.role === "DOCTOR") {
    doctorProfile = await DoctorProfile.findOne({ userId: user._id });
  }

  res.json({
    success: true,
    user: publicUser(user),
    doctorProfile,
  });
});

// PUT /api/auth/me
export const updateMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const body = req.body as UpdateProfileInput;

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
      ...(body.avatar !== undefined ? { avatar: body.avatar } : {}),
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({
    success: true,
    message: "Profile updated",
    user: publicUser(user),
  });
});
