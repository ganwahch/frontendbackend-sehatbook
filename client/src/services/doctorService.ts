import { api } from "./api";
import { DoctorListItem, DoctorProfile, Review } from "@/types";

export interface DoctorFilters {
  search?: string;
  specialization?: string;
  city?: string;
  maxFee?: string;
  sort?: "rating" | "fee" | "experience";
}

export async function getDoctors(
  filters: DoctorFilters
): Promise<DoctorListItem[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  const { data } = await api.get<{
    success: boolean;
    doctors: DoctorListItem[];
  }>(`/doctors?${params.toString()}`);
  return data.doctors;
}

export async function getDoctorById(
  id: string
): Promise<{ doctor: DoctorListItem; reviews: Review[] }> {
  const { data } = await api.get<{
    success: boolean;
    doctor: DoctorListItem;
    reviews: Review[];
  }>(`/doctors/${id}`);
  return { doctor: data.doctor, reviews: data.reviews };
}

export async function getMyDoctorProfile(): Promise<DoctorProfile> {
  const { data } = await api.get<{ success: boolean; profile: DoctorProfile }>(
    "/doctors/me/profile"
  );
  return data.profile;
}

export async function updateMyDoctorProfile(
  payload: Partial<Pick<
    DoctorProfile,
    | "specialization"
    | "experience"
    | "fee"
    | "bio"
    | "education"
    | "clinicAddress"
    | "availableDays"
  >>
): Promise<DoctorProfile> {
  const { data } = await api.put<{ success: boolean; profile: DoctorProfile }>(
    "/doctors/me/profile",
    payload
  );
  return data.profile;
}
