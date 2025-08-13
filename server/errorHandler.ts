import type { Request, Response, NextFunction } from "express";

import { isDevelopment } from "./config";
import { logger } from "./logger";

/**
 * Secure error handling with sensitive data protection
 * Provides detailed logging while preventing information leakage
 */

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: unknown;
}

export class SecurityError extends Error {
  statusCode = 403;
  code = "SECURITY_VIOLATION";
  isOperational = true;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "SecurityError";

    // Log security violations immediately
    logger.error(message, details);
  }
}

export class ValidationError extends Error {
  statusCode = 400;
  code = "VALIDATION_ERROR";
  isOperational = true;
  details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  code = "AUTHENTICATION_ERROR";
  isOperational = true;

  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  code = "AUTHORIZATION_ERROR";
  isOperational = true;

  constructor(message: string = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  code = "RATE_LIMIT_EXCEEDED";
  isOperational = true;

  constructor(message: string = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class DatabaseError extends Error {
  statusCode = 500;
  code = "DATABASE_ERROR";
  isOperational = true;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = "DatabaseError";

    // Log database errors with sanitized details
    logger.error("Database error", { message, originalError });
  }
}

/**
 * Sanitize error details for client response
 */
function sanitizeErrorForClient(error: AppError): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {
    message: error.message,
    code: error.code,
  };

  // Only include details in development or for operational errors
  if (isDevelopment && error.details) {
    sanitized.details = error.details;
  }

  // Never expose stack traces in production
  if (isDevelopment && error.stack) {
    sanitized.stack = error.stack;
  }

  return sanitized;
}

// Removed unused function _isOperationalError

/**
 * Get appropriate HTTP status code for error
 */
function getStatusCode(error: AppError): number {
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 600) {
    return error.statusCode;
  }

  // Default to 500 for unknown errors
  return 500;
}

/**
 * Extract user context from request for logging
 */
function extractUserContext(req: Request): Record<string, unknown> {
  const { telegramUser } = req as any;
  return {
    userId: telegramUser?.id,
    username: telegramUser?.username,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    method: req.method,
    path: req.path,
    query: req.query,
  };
}

/**
 * Main error handling middleware
 */
export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = getStatusCode(error);
  const userContext = extractUserContext(req);

  // Log error with appropriate level
  if (statusCode >= 500) {
    // Server errors - log as error
    logger.error(`Server Error: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
      context: userContext,
    });
  } else if (statusCode >= 400) {
    // Client errors - log as warning
    logger.warn(`Client Error: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
      context: userContext,
    });
  }

  // Send appropriate response to client
  const response = {
    error: sanitizeErrorForClient(error),
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Add request ID if available
  const requestId = req.get("X-Request-ID");
  if (requestId) {
    (response as any).requestId = requestId;
  }

  res.status(statusCode).json(response);
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
  logger.error("Unhandled Promise Rejection", {
    reason: (reason as any)?.message || reason,
    stack: (reason as any)?.stack,
    promise: promise.toString(),
  });

  // In production, gracefully shutdown
  if (!isDevelopment) {
    logger.error("Shutting down due to unhandled promise rejection");
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(error: Error): void {
  logger.error("Uncaught Exception", {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });

  // Always exit on uncaught exceptions
  logger.error("Shutting down due to uncaught exception");
  process.exit(1);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error helper
 */
export function createValidationError(message: string, details?: unknown): ValidationError {
  return new ValidationError(message, details);
}

/**
 * Security error helper
 */
export function createSecurityError(message: string, details?: unknown): SecurityError {
  return new SecurityError(message, details);
}

/**
 * Database error helper
 */
export function createDatabaseError(message: string, originalError?: Error): DatabaseError {
  return new DatabaseError(message, originalError);
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers(): void {
  process.on("unhandledRejection", handleUnhandledRejection);
  process.on("uncaughtException", handleUncaughtException);

  logger.info("Global error handlers configured");
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const error = {
    message: `Route ${req.method} ${req.path} not found`,
    code: "ROUTE_NOT_FOUND",
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  logger.warn("Route not found", {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({ error });
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupGlobalErrorHandlers,
  SecurityError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  DatabaseError,
  createValidationError,
  createSecurityError,
  createDatabaseError,
};
