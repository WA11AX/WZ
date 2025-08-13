import type { Request, Response, NextFunction } from "express";
import { isDevelopment } from "./config";

// Simple rate limiter that just passes through in development
export const generalLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (isDevelopment) {
    return next();
  }
  // In production, you could implement proper rate limiting here
  next();
};

export const authLimiter = generalLimiter;
export const tournamentCreationLimiter = generalLimiter;
export const tournamentRegistrationLimiter = generalLimiter;
export const adminLimiter = generalLimiter;
export const websocketLimiter = generalLimiter;
export const uploadLimiter = generalLimiter;

export function createCustomLimiter(options: any) {
  return generalLimiter;
}

export function createSimpleRateLimit(_limit: number, _window: number, _options: any) {
  // Placeholder for simple rate limiting implementation
}