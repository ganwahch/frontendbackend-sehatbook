import { api } from "./api";
import { AuthResponse, User, DoctorProfile } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "PATIENT" | "DOCTOR";
  phone?: string;
  city?: string;
  // doctor-only
  specialization?: string;
  experience?: number;
  fee?: number;
  bio?: string;
  education?: string;
  clinicAddress?: string;
  availableDays?: string[];
}

export async function loginRequest(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function registerRequest(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function fetchMe(): Promise<{
  user: User;
  doctorProfile: DoctorProfile | null;
}> {
  const { data } = await api.get<{
    success: boolean;
    user: User;
    doctorProfile: DoctorProfile | null;
  }>("/auth/me");
  return { user: data.user, doctorProfile: data.doctorProfile };
}

export async function updateProfileRequest(payload: {
  name?: string;
  phone?: string;
  city?: string;
  avatar?: string;
}): Promise<User> {
  const { data } = await api.put<{ success: boolean; user: User }>(
    "/auth/me",
    payload
  );
  return data.user;
}
