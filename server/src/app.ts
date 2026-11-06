import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { notFound, errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/authRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import adminRoutes from "./routes/adminRoutes";

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser clients (no origin) and any configured origin.
        if (!origin || env.clientUrls.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
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
