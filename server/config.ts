import { z } from "zod";

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

  // Telegram Bot (optional in development)
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
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
    .optional(),

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
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });

      // Show missing required variables
      const missingVars = error.errors
        .filter((err) => err.code === "invalid_type" && err.received === "undefined")
        .map((err) => err.path.join("."));

      if (missingVars.length > 0) {
        console.error("\n📝 Missing required environment variables:");
        missingVars.forEach((varName) => {
          console.error(`  - ${varName}`);
        });
        console.error("\n💡 Please check your .env file or environment configuration.");
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
  botToken: config.TELEGRAM_BOT_TOKEN || (isDevelopment ? 'dev-mode' : undefined),
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
  skipRateLimiting: config.SKIP_RATE_LIMITING && isDevelopment,
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
  const criticalSecrets = ["DATABASE_URL", "SESSION_SECRET"];
  
  // Only require TELEGRAM_BOT_TOKEN in production
  if (isProduction) {
    criticalSecrets.push("TELEGRAM_BOT_TOKEN");
  }

  const missing = criticalSecrets.filter((secret) => !process.env[secret]);

  if (missing.length > 0) {
    console.error("❌ Critical secrets missing:");
    missing.forEach((secret) => console.error(`  - ${secret}`));
    console.error("\n🔒 Application cannot start without these secrets.");
    process.exit(1);
  }

  // Validate secret strength
  if (config.SESSION_SECRET.length < 32) {
    console.error("❌ SESSION_SECRET must be at least 32 characters long");
    process.exit(1);
  }

  // Validate Telegram bot token format only if provided
  if (config.TELEGRAM_BOT_TOKEN && !/^\d+:[A-Za-z0-9_-]+$/.test(config.TELEGRAM_BOT_TOKEN)) {
    console.error("❌ TELEGRAM_BOT_TOKEN format is invalid");
    process.exit(1);
  }

  console.log("✅ All critical secrets validated");
}

/**
 * Generate secure random string for secrets
 */
export function generateSecureSecret(length: number = 64): string {
  const crypto = require("crypto");
  return crypto.randomBytes(length).toString("hex");
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
  console.log("🔧 Configuration loaded:");
  console.log(`  - Environment: ${config.NODE_ENV}`);
  console.log(`  - Port: ${config.PORT}`);
  console.log(`  - Database: ${maskSecret(config.DATABASE_URL)}`);
  console.log(`  - Telegram Bot: ${config.TELEGRAM_BOT_TOKEN ? maskSecret(config.TELEGRAM_BOT_TOKEN) : 'not configured'}`);
  console.log(`  - Session Secret: ${maskSecret(config.SESSION_SECRET)}`);
}

export default config;
