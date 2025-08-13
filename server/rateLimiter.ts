import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { securityConfig, isDevelopment } from './config';

function shouldSkipRateLimit(): boolean {
  return securityConfig.skipRateLimiting;
}

/**
 * Rate limiting configuration for different API endpoints
 */

// General API rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Use Telegram user ID if available, otherwise fall back to IP
    const telegramUser = (req as any).telegramUser;
    return telegramUser?.id?.toString() || req.ip || 'unknown';
  },
  skip: (req: Request) => {
    // Skip rate limiting in development if specified
    return shouldSkipRateLimit();
  }
});

// Strict limiter for authentication attempts - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Tournament creation limiter - 10 requests per hour
export const tournamentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 tournament creations per hour
  message: {
    error: 'Tournament creation limit exceeded',
    message: 'You can only create 10 tournaments per hour. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const telegramUser = (req as any).telegramUser;
    return telegramUser?.id?.toString() || req.ip || 'unknown';
  },
});

// Tournament registration limiter - 20 requests per 10 minutes
export const tournamentRegistrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each user to 20 registrations per 10 minutes
  message: {
    error: 'Registration limit exceeded',
    message: 'Too many registration attempts. Please try again later.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const telegramUser = (req as any).telegramUser;
    return telegramUser?.id?.toString() || req.ip || 'unknown';
  },
});

// Admin operations limiter - 50 requests per 15 minutes
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit admin operations
  message: {
    error: 'Admin operation limit exceeded',
    message: 'Too many admin operations. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const telegramUser = (req as any).telegramUser;
    return `admin_${telegramUser?.id?.toString() || req.ip || 'unknown'}`;
  },
});

// WebSocket connection limiter - 10 connections per minute
export const websocketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit WebSocket connections
  message: {
    error: 'WebSocket connection limit exceeded',
    message: 'Too many WebSocket connection attempts.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Custom rate limiter for specific operations
 */
export function createCustomLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: 'Rate limit exceeded',
      message: options.message,
      retryAfter: `${Math.ceil(options.windowMs / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      const telegramUser = (req as any).telegramUser;
      return telegramUser?.id?.toString() || req.ip || 'unknown';
    }),
    skip: (req: Request) => {
      return shouldSkipRateLimit();
    }
  });
}

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = createCustomLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: 'Too many file uploads. Please try again later.'
});

/**
 * Rate limiter for search operations
 */
export const searchLimiter = createCustomLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests. Please slow down.'
});

export default {
  general: generalLimiter,
  auth: authLimiter,
  tournamentCreation: tournamentCreationLimiter,
  tournamentRegistration: tournamentRegistrationLimiter,
  admin: adminLimiter,
  websocket: websocketLimiter,
  upload: uploadLimiter,
  search: searchLimiter,
  createCustom: createCustomLimiter
};