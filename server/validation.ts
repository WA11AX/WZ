import { z } from "zod";

import { createValidationError } from "./errorHandler";
import { logger } from "./logger";

/**
 * Secure input validation with attack prevention
 * Protects against XSS, SQL injection, and other common attacks
 */

// Common validation patterns
const PATTERNS = {
  // Safe string without HTML/script tags
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%&*+=/\\|~`^]*$/,

  // Username: alphanumeric, underscore, hyphen
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,

  // Tournament name: letters, numbers, spaces, basic punctuation
  TOURNAMENT_NAME: /^[a-zA-Z0-9\s\-_.,!?()]{3,100}$/,

  // Description: more permissive but still safe
  DESCRIPTION: /^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%&*+=/\\|~`^\n\r]{0,1000}$/,

  // Telegram user ID: numeric string
  TELEGRAM_ID: /^\d{1,15}$/,

  // URL: basic URL validation
  URL: /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/,

  // Date: ISO 8601 format
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
};

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  // Script tags
  /<script[^>]*>.*?<\/script>/gi,

  // Event handlers
  /on\w+\s*=/gi,

  // JavaScript URLs
  /javascript:/gi,

  // Data URLs
  /data:/gi,

  // SQL injection patterns
  /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi,

  // Command injection
  /[;&|`$(){}[\]]/,

  // Path traversal
  /\.\.[/\\]/,

  // Null bytes - removed to avoid control character error
];

/**
 * Check if string contains dangerous patterns
 */
function containsDangerousPatterns(input: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitize string by removing dangerous characters
 */
function sanitizeString(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript URLs
    .replace(/data:/gi, "") // Remove data URLs
    .replace(/[\u007f-\u009f]/g, "") // Remove control characters
    .trim();
}

/**
 * Custom Zod string validator with security checks
 */
function secureString(
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
    sanitize?: boolean;
  } = {},
) {
  return z
    .string()
    .transform((val, ctx) => {
      // Check for dangerous patterns
      if (containsDangerousPatterns(val)) {
        logger.error("Dangerous pattern detected in input", { input: val.substring(0, 100) });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Input contains potentially dangerous content",
        });
        return z.NEVER;
      }

      // Sanitize if requested
      if (options.sanitize) {
        return sanitizeString(val);
      }

      return val;
    })
    .refine(
      (val) => {
        if (!options.allowEmpty && val.length === 0) {
          return false;
        }
        return true;
      },
      { message: "Value cannot be empty" },
    )
    .refine(
      (val) => {
        if (options.minLength && val.length < options.minLength) {
          return false;
        }
        return true;
      },
      { message: `Minimum length is ${options.minLength}` },
    )
    .refine(
      (val) => {
        if (options.maxLength && val.length > options.maxLength) {
          return false;
        }
        return true;
      },
      { message: `Maximum length is ${options.maxLength}` },
    )
    .refine(
      (val) => {
        if (options.pattern && !options.pattern.test(val)) {
          return false;
        }
        return true;
      },
      { message: "Invalid format" },
    );
}

/**
 * Telegram user ID validator
 */
export const telegramIdSchema = z
  .string()
  .regex(PATTERNS.TELEGRAM_ID, "Invalid Telegram ID format")
  .transform(Number)
  .refine((id) => id > 0 && id < Number.MAX_SAFE_INTEGER, "Invalid Telegram ID range");

/**
 * Username validator
 */
export const usernameSchema = secureString({
  minLength: 3,
  maxLength: 30,
  pattern: PATTERNS.USERNAME,
});

/**
 * Tournament name validator
 */
export const tournamentNameSchema = secureString({
  minLength: 3,
  maxLength: 100,
  pattern: PATTERNS.TOURNAMENT_NAME,
  sanitize: true,
});

/**
 * Description validator
 */
export const descriptionSchema = secureString({
  maxLength: 1000,
  pattern: PATTERNS.DESCRIPTION,
  allowEmpty: true,
  sanitize: true,
});

/**
 * Date validator
 */
export const dateSchema = z
  .string()
  .regex(PATTERNS.ISO_DATE, "Invalid date format")
  .transform((val) => new Date(val))
  .refine((date) => !isNaN(date.getTime()), "Invalid date")
  .refine((date) => date > new Date(), "Date must be in the future");

/**
 * URL validator
 */
export const urlSchema = z
  .string()
  .regex(PATTERNS.URL, "Invalid URL format")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Only allow HTTP/HTTPS
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, "Invalid URL");

/**
 * Pagination validator
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 1;
      return Math.max(1, Math.min(1000, num)); // Limit to reasonable range
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 10;
      return Math.max(1, Math.min(100, num)); // Limit to reasonable range
    }),
});

/**
 * Tournament creation validator
 */
export const createTournamentSchema = z
  .object({
    name: tournamentNameSchema,
    description: descriptionSchema,
    startDate: dateSchema,
    endDate: dateSchema,
    maxParticipants: z
      .number()
      .int()
      .min(2, "Minimum 2 participants")
      .max(1000, "Maximum 1000 participants"),
    entryFee: z.number().min(0, "Entry fee cannot be negative").max(1000000, "Entry fee too high"),
    rules: descriptionSchema,
    isPublic: z.boolean().default(true),
  })
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

/**
 * Tournament update validator
 */
export const updateTournamentSchema = z.object({
  name: tournamentNameSchema.optional(),
  description: descriptionSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  maxParticipants: z
    .number()
    .int()
    .min(2, "Minimum 2 participants")
    .max(1000, "Maximum 1000 participants")
    .optional(),
  prizePool: z.number().min(0, "Prize pool cannot be negative").optional(),
  rules: descriptionSchema.optional(),
  isPublic: z.boolean().optional(),
});

/**
 * User registration validator
 */
export const userRegistrationSchema = z.object({
  telegramId: telegramIdSchema,
  username: usernameSchema.optional(),
  firstName: secureString({ minLength: 1, maxLength: 50, sanitize: true }),
  lastName: secureString({ maxLength: 50, allowEmpty: true, sanitize: true }),
});

/**
 * Tournament registration validator
 */
export const tournamentRegistrationSchema = z.object({
  tournamentId: z.string().uuid("Invalid tournament ID"),
  teamName: secureString({
    minLength: 3,
    maxLength: 50,
    pattern: PATTERNS.TOURNAMENT_NAME,
    sanitize: true,
  }).optional(),
});

/**
 * Search query validator
 */
export const searchQuerySchema = z.object({
  q: secureString({
    maxLength: 100,
    allowEmpty: true,
    sanitize: true,
  }).optional(),
  category: z.enum(["all", "active", "upcoming", "completed"]).default("all"),
  sortBy: z.enum(["name", "startDate", "participants", "created"]).default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  ...paginationSchema.shape,
});

/**
 * Validation middleware factory
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Validation failed", {
          path: req.path,
          method: req.method,
          errors,
          body: req.body,
        });

        throw createValidationError("Validation failed", { errors });
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Query validation middleware factory
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Query validation failed", {
          path: req.path,
          method: req.method,
          errors,
          query: req.query,
        });

        throw createValidationError("Query validation failed", { errors });
      }

      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Params validation middleware factory
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Params validation failed", {
          path: req.path,
          method: req.method,
          errors,
          params: req.params,
        });

        throw createValidationError("Params validation failed", { errors });
      }

      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export default {
  validateBody,
  validateQuery,
  validateParams,
  createTournamentSchema,
  updateTournamentSchema,
  userRegistrationSchema,
  tournamentRegistrationSchema,
  searchQuerySchema,
  paginationSchema,
  secureString,
  sanitizeString,
};
