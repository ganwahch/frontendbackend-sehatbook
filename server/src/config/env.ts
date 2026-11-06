import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// CLIENT_URL may be a single origin or a comma-separated list, e.g.
// "http://localhost:5173,https://sehatbook.vercel.app"
const clientUrlRaw = process.env.CLIENT_URL ?? "http://localhost:5173";

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: required("MONGO_URI", "mongodb://127.0.0.1:27017/sehatbook"),
  jwtSecret: required("JWT_SECRET", "super_secret_change_me_in_production"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrl: clientUrlRaw,
  clientUrls: clientUrlRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;
