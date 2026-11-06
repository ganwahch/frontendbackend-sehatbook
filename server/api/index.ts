/**
 * Vercel serverless entry point for the SehatBook API.
 *
 * Vercel runs this file as a serverless function (via @vercel/node). The
 * `vercel.json` rewrite sends every request here, and the original URL
 * (e.g. /api/auth/login) is preserved, so the Express app matches its routes
 * normally. The MongoDB connection is established lazily and cached across
 * invocations by connectDB().
 */
import { createApp } from "../src/app";
import { connectDB } from "../src/config/db";

const app = createApp();
let ready: Promise<void> | null = null;

type NodeHandler = (req: unknown, res: unknown) => void;

export default async function handler(req: unknown, res: unknown) {
  if (!ready) ready = connectDB();
  await ready;
  return (app as unknown as NodeHandler)(req, res);
}
