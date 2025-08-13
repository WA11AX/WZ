import { Request } from "express";
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export function logRequest(
  req: Request,
  message: string,
  level: "info" | "warn" | "error" = "info",
) {
  const userContext = {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    method: req.method,
    url: req.url,
  };

  logger[level](message, { request: userContext });
}

// Development logging
if (process.env.NODE_ENV !== "production") {
  logger.debug("Logger initialized in development mode");
}

export { logger };
export default logger;
