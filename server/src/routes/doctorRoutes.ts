import { Router } from "express";
import {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "../controllers/doctorController";
import { protect, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { updateDoctorProfileSchema } from "../validators/doctorValidators";

const router = Router();

// Doctor's own profile (specific routes before the dynamic ":id")
router.get("/me/profile", protect, authorize("DOCTOR"), getMyDoctorProfile);
router.put(
  "/me/profile",
  protect,
  authorize("DOCTOR"),
  validate(updateDoctorProfileSchema),
  updateMyDoctorProfile
);

// Public
router.get("/", getDoctors);
router.get("/:id", getDoctorById);

export default router;
