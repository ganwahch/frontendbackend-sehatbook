import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;

    // Mongoose duplicate key (e.g. double booking / duplicate email)
    const anyErr = err as unknown as { code?: number; keyValue?: object };
    if (anyErr.code === 11000) {
      statusCode = 409;
      message = "Duplicate entry. This record already exists.";
    }
    // Mongoose cast error (bad ObjectId)
    if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid identifier format";
    }
  }

  if (statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}
