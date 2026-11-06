import { Router } from "express";
import {
  getStats,
  getUsers,
  deleteUser,
  getAdminDoctors,
  setDoctorApproval,
  deleteDoctor,
  getAdminAppointments,
} from "../controllers/adminController";
import { protect, authorize } from "../middlewares/auth";

const router = Router();

// All admin routes require ADMIN role
router.use(protect, authorize("ADMIN"));

router.get("/stats", getStats);

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

router.get("/doctors", getAdminDoctors);
router.put("/doctors/:id/approve", setDoctorApproval);
router.delete("/doctors/:id", deleteDoctor);

router.get("/appointments", getAdminAppointments);

export default router;
