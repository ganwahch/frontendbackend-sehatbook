import mongoose from "mongoose";
import { env } from "./env";

/**
 * Cached connection. In a long-running server this connects once. In a
 * serverless environment (e.g. Vercel) the same container may handle many
 * requests, so we reuse the existing connection / in-flight promise instead
 * of opening a new one every time.
 */
let cached: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) return;

  if (!cached) {
    cached = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    await cached;
    console.log("✅ MongoDB connected");
  } catch (error) {
    cached = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
