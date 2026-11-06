import { Router } from "express";
import {
  createReview,
  getDoctorReviews,
} from "../controllers/reviewController";
import { protect, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createReviewSchema } from "../validators/reviewValidators";

const router = Router();

router.post(
  "/",
  protect,
  authorize("PATIENT"),
  validate(createReviewSchema),
  createReview
);
router.get("/:doctorId", getDoctorReviews);

export default router;
