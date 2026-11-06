import { api } from "./api";
import {
  AdminStats,
  AdminUserRow,
  AdminDoctorRow,
  AdminAppointmentRow,
  Pagination,
} from "@/types";

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats & { success: boolean }>(
    "/admin/stats"
  );
  return data;
}

export async function getAdminUsers(params: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: AdminUserRow[]; pagination: Pagination }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.append(k, String(v));
  });
  const { data } = await api.get<{
    success: boolean;
    users: AdminUserRow[];
    pagination: Pagination;
  }>(`/admin/users?${query.toString()}`);
  return { users: data.users, pagination: data.pagination };
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function getAdminDoctors(params: {
  search?: string;
  approved?: string;
}): Promise<AdminDoctorRow[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.append(k, String(v));
  });
  const { data } = await api.get<{
    success: boolean;
    doctors: AdminDoctorRow[];
  }>(`/admin/doctors?${query.toString()}`);
  return data.doctors;
}

export async function setDoctorApproval(
  id: string,
  isApproved: boolean
): Promise<void> {
  await api.put(`/admin/doctors/${id}/approve`, { isApproved });
}

export async function deleteDoctor(id: string): Promise<void> {
  await api.delete(`/admin/doctors/${id}`);
}

export async function getAdminAppointments(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ appointments: AdminAppointmentRow[]; pagination: Pagination }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.append(k, String(v));
  });
  const { data } = await api.get<{
    success: boolean;
    appointments: AdminAppointmentRow[];
    pagination: Pagination;
  }>(`/admin/appointments?${query.toString()}`);
  return { appointments: data.appointments, pagination: data.pagination };
}
