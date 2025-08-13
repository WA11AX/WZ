import { z } from "zod";
import { logger } from "./logger";

/**
 * Environment configuration with validation
 * Ensures all required secrets are present and properly formatted
 */

// Define the schema for environment variables
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default("3000"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Telegram Bot
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  ADMIN_TELEGRAM_ID: z.string().optional(),

  // Session secrets
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  // Security settings
  CORS_ORIGIN: z.string().optional(),
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10).max(15)).default("12"),

  // Rate limiting
  SKIP_RATE_LIMITING: z
    .string()
    .transform((val) => val === "true")
    .default("true"), // Always skip in development

  // Telegram validation
  SKIP_TELEGRAM_VALIDATION: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  // File upload
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default("5242880"), // 5MB
  UPLOAD_DIR: z.string().default("./uploads"),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Analytics (optional)
  ANALYTICS_ID: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().optional(),
});

// Validate and parse environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        logger.error(`  - ${err.path.join(".")}: ${err.message}`);
      });

      // Show missing required variables
      const missingVars = error.errors
        .filter((err) => err.code === "invalid_type" && err.received === "undefined")
        .map((err) => err.path.join("."));

      if (missingVars.length > 0) {
        logger.error("\n📝 Missing required environment variables:");
        missingVars.forEach((varName) => {
          logger.error(`  - ${varName}`);
        });
        logger.error("\n💡 Please check your .env file or environment configuration.");
      }
    }

    process.exit(1);
  }
}

// Export validated configuration
export const config = validateEnv();

// Helper functions for common configurations
export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

/**
 * Database configuration
 */
export const dbConfig = {
  url: config.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

/**
 * Telegram configuration
 */
export const telegramConfig = {
  botToken: config.TELEGRAM_BOT_TOKEN,
  adminId: config.ADMIN_TELEGRAM_ID,
  skipValidation: config.SKIP_TELEGRAM_VALIDATION && isDevelopment,
};

/**
 * Security configuration
 */
export const securityConfig = {
  sessionSecret: config.SESSION_SECRET,
  corsOrigin: config.CORS_ORIGIN || (isDevelopment ? "*" : undefined),
  bcryptRounds: config.BCRYPT_ROUNDS,
  skipRateLimiting: config.SKIP_RATE_LIMITING || isDevelopment,
};

/**
 * File upload configuration
 */
export const uploadConfig = {
  maxFileSize: config.MAX_FILE_SIZE,
  uploadDir: config.UPLOAD_DIR,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
};

/**
 * Logging configuration
 */
export const loggingConfig = {
  level: config.LOG_LEVEL,
  file: config.LOG_FILE,
  console: isDevelopment,
};

/**
 * Validate critical secrets on startup
 */
export function validateCriticalSecrets() {
  // Validate critical secrets
  const missingSecrets = [];
  if (!dbConfig.url) missingSecrets.push("DATABASE_URL");
  if (!telegramConfig.botToken) missingSecrets.push("TELEGRAM_BOT_TOKEN");

  if (missingSecrets.length > 0) {
    throw new Error(`Missing required environment variables: ${missingSecrets.join(", ")}`);
  }

  // Validate secret strength
  if (config.SESSION_SECRET.length < 32) {
    logger.error("❌ SESSION_SECRET must be at least 32 characters long");
    process.exit(1);
  }

  // Validate Telegram bot token format
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(config.TELEGRAM_BOT_TOKEN)) {
    logger.error("❌ TELEGRAM_BOT_TOKEN format is invalid");
    process.exit(1);
  }
}

/**
 * Generate secure random string for secrets
 */
export function generateSecureSecret(length: number = 64): string {
  return Array.from({ length }, () => Math.random().toString(36)[2]).join("");
}

/**
 * Mask sensitive values for logging
 */
export function maskSecret(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) {
    return "*".repeat(8);
  }

  const visible = value.slice(0, visibleChars);
  const masked = "*".repeat(Math.max(8, value.length - visibleChars));
  return visible + masked;
}

// Log configuration on startup (with masked secrets)
if (isDevelopment) {
  logger.debug("🔧 Configuration loaded:");
  logger.debug(`  - Environment: ${config.NODE_ENV}`);
  logger.debug(`  - Port: ${config.PORT}`);
  logger.debug(`  - Database: ${maskSecret(config.DATABASE_URL)}`);
  logger.debug(`  - Telegram Bot: ${maskSecret(config.TELEGRAM_BOT_TOKEN)}`);
  logger.debug(`  - Session Secret: ${maskSecret(config.SESSION_SECRET)}`);
}

export default config;
