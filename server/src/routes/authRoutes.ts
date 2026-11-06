import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateMe,
} from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/auth";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/authValidators";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.put("/me", protect, validate(updateProfileSchema), updateMe);

export default router;
