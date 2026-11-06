import { Request } from "express";

export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface JwtPayload {
  id: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
