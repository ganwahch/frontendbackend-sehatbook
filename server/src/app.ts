import express, { Application, Request, Response } from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/authRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import adminRoutes from "./routes/adminRoutes";

export function createApp(): Application {
  const app = express();

  // Reflect the request origin so the API works from any deployed frontend.
  // Auth uses JWT in the Authorization header (not cookies), so this is safe.
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ success: true, message: "SehatBook API is running 🩺" });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/admin", adminRoutes);

  // 404 + error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
