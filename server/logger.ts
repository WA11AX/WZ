import { loggingConfig, maskSecret } from "./config";

export interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  private level: number;
  private sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "auth",
    "session",
    "x-telegram-init-data",
    "telegram_bot_token",
    "database_url",
  ];

  constructor() {
    this.level = this.getLogLevel(loggingConfig.level);
  }

  private getLogLevel(level: string): number {
    switch (level.toLowerCase()) {
      case "error":
        return LOG_LEVELS.ERROR;
      case "warn":
        return LOG_LEVELS.WARN;
      case "info":
        return LOG_LEVELS.INFO;
      case "debug":
        return LOG_LEVELS.DEBUG;
      default:
        return LOG_LEVELS.INFO;
    }
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === "object" && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
          sanitized[key] = maskSecret(String(value));
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return data;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? this.sanitizeData(meta) : undefined;
    const metaStr = sanitizedMeta ? ` ${JSON.stringify(sanitizedMeta)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage("ERROR", message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage("WARN", message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage("INFO", message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage("DEBUG", message, meta));
    }
  }
}

export const logger = new Logger();
export default logger;