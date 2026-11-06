import { Router } from "express";
import {
  createAppointment,
  getAppointments,
  getBookedSlots,
  updateAppointmentStatus,
  deleteAppointment,
  getDoctorStats,
} from "../controllers/appointmentController";
import { protect, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createAppointmentSchema,
  updateStatusSchema,
} from "../validators/appointmentValidators";

const router = Router();

// Public helper for the booking UI
router.get("/booked", getBookedSlots);

// Doctor stats (specific before generic)
router.get("/doctor/stats", protect, authorize("DOCTOR"), getDoctorStats);

router.post(
  "/",
  protect,
  authorize("PATIENT"),
  validate(createAppointmentSchema),
  createAppointment
);
router.get("/", protect, getAppointments);
router.put(
  "/:id/status",
  protect,
  validate(updateStatusSchema),
  updateAppointmentStatus
);
router.delete("/:id", protect, deleteAppointment);

export default router;
