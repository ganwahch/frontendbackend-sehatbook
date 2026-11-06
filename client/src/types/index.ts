export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  city: string;
  avatar: string;
}

export interface DoctorProfile {
  _id: string;
  userId: string;
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
}

/** Doctor as returned by the public listing (profile + user fields flattened) */
export interface DoctorListItem {
  _id: string;
  specialization: string;
  experience: number;
  fee: number;
  bio: string;
  education: string;
  clinicAddress: string;
  availableDays: string[];
  rating: number;
  ratingCount: number;
  name: string;
  city: string;
  avatar: string;
  email: string;
  phone?: string;
  isApproved?: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  patientName: string;
  patientAvatar: string;
}

export interface PopulatedPatient {
  _id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface PopulatedDoctor {
  _id: string;
  specialization: string;
  fee: number;
  userId: { _id: string; name: string; avatar?: string };
}

export interface Appointment {
  _id: string;
  patientId: PopulatedPatient | string;
  doctorId: PopulatedDoctor | string;
  date: string;
  timeSlot: string;
  reason: string;
  status: AppointmentStatus;
  fee: number;
  createdAt: string;
}

export interface AdminAppointmentRow {
  _id: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: AppointmentStatus;
  fee: number;
  createdAt: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  specialization: string;
}

export interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  city?: string;
  createdAt: string;
}

export interface AdminDoctorRow {
  _id: string;
  specialization: string;
  experience: number;
  fee: number;
  rating: number;
  isApproved: boolean;
  name: string;
  email: string;
  city?: string;
  avatar?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalDoctors: number;
    totalAppointments: number;
    revenue: number;
  };
  appointmentsPerWeek: { date: string; label: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
}

export interface DoctorStats {
  totalAppointments: number;
  today: number;
  earnings: number;
  patients: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
