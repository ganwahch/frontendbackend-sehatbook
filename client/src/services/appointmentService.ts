import { api } from "./api";
import { Appointment, AppointmentStatus, DoctorStats } from "@/types";

export interface CreateAppointmentPayload {
  doctorId: string;
  date: string;
  timeSlot: string;
  reason: string;
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const { data } = await api.post<{ success: boolean; appointment: Appointment }>(
    "/appointments",
    payload
  );
  return data.appointment;
}

export async function getAppointments(
  status?: AppointmentStatus
): Promise<Appointment[]> {
  const query = status ? `?status=${status}` : "";
  const { data } = await api.get<{
    success: boolean;
    appointments: Appointment[];
  }>(`/appointments${query}`);
  return data.appointments;
}

export async function getBookedSlots(
  doctorId: string,
  date: string
): Promise<string[]> {
  const { data } = await api.get<{ success: boolean; bookedSlots: string[] }>(
    `/appointments/booked?doctorId=${doctorId}&date=${date}`
  );
  return data.bookedSlots;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const { data } = await api.put<{ success: boolean; appointment: Appointment }>(
    `/appointments/${id}/status`,
    { status }
  );
  return data.appointment;
}

export async function cancelAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function getDoctorStats(): Promise<DoctorStats> {
  const { data } = await api.get<{ success: boolean; stats: DoctorStats }>(
    "/appointments/doctor/stats"
  );
  return data.stats;
}
