import { Response, NextFunction } from "express";
import { AuthRequest, Role } from "../types";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

/**
 * Verifies the Bearer token and attaches { id, role } to req.user.
 */
export function protect(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No token provided");
  }
  const token = header.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

/**
 * Restricts a route to the given roles. Must run after `protect`.
 */
export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have access to this resource");
    }
    next();
  };
}
