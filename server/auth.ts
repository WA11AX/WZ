import crypto from "crypto";

import type { Request } from "express";

import { telegramConfig, isDevelopment } from "./config";

/**
 * Telegram Web App initData validation
 * Based on official Telegram documentation
 */

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

interface TelegramInitData {
  user?: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

/**
 * Validates Telegram Web App initData
 * @param initData - Raw initData string from Telegram
 * @param botToken - Bot token for HMAC validation
 * @returns Parsed and validated data or null if invalid
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
): TelegramInitData | null {
  try {
    // Parse URL-encoded data
    const urlParams = new URLSearchParams(initData);
    const data: Record<string, string> = {};

    for (const [key, value] of urlParams.entries()) {
      data[key] = value;
    }

    // Extract hash and remove it from data for validation
    const { hash } = data;
    if (!hash) {
      console.warn("No hash found in initData");
      return null;
    }
    delete data.hash;

    // Create data-check-string
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join("\n");

    // Create secret key
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();

    // Calculate expected hash
    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Verify hash
    if (hash !== expectedHash) {
      console.warn("Invalid initData hash");
      return null;
    }

    // Parse auth_date and validate timestamp
    const authDate = parseInt(data.auth_date);
    if (isNaN(authDate)) {
      console.warn("Invalid auth_date in initData");
      return null;
    }

    // Check if data is not older than 24 hours (86400 seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      console.warn("initData is too old");
      return null;
    }

    // Parse user data if present
    let user: TelegramUser | undefined;
    if (data.user) {
      try {
        user = JSON.parse(data.user);
      } catch (error) {
        console.warn("Failed to parse user data:", error);
        return null;
      }
    }

    return {
      user,
      chat_instance: data.chat_instance,
      chat_type: data.chat_type,
      auth_date: authDate,
      hash,
      ...data,
    };
  } catch (error) {
    console.error("Error validating Telegram initData:", error);
    return null;
  }
}

/**
 * Extract and validate Telegram data from Express request
 * @param req - Express request object
 * @returns Validated Telegram data or null
 */
export function extractTelegramData(req: Request): TelegramInitData | null {
  const initData = req.headers["x-telegram-init-data"] as string;
  const { botToken } = telegramConfig;

  if (!initData) {
    console.warn("No x-telegram-init-data header found");
    return null;
  }

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return null;
  }

  // In development, allow bypassing validation for testing
  if (telegramConfig.skipValidation) {
    console.warn("⚠️ Skipping Telegram validation in development mode");
    try {
      const urlParams = new URLSearchParams(initData);
      const userData = urlParams.get("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("🔧 Development mode - using mock user:", user.first_name);
        return {
          user,
          auth_date: Math.floor(Date.now() / 1000),
          hash: "dev-mode",
        };
      }
    } catch (error) {
      console.warn("Failed to parse development initData:", error);
    }
    return null;
  }

  return validateTelegramInitData(initData, botToken);
}

/**
 * Middleware to validate Telegram authentication
 */
export function telegramAuthMiddleware(req: Request, res: any, next: any) {
  const telegramData = extractTelegramData(req);

  if (!telegramData?.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing Telegram authentication data",
    });
  }

  // Add Telegram data to request for use in routes
  (req as any).telegramData = telegramData;
  (req as any).telegramUser = telegramData.user;

  next();
}
