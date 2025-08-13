import type { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      isAdmin: boolean;
    };
  }
}

interface RequestWithSession extends Request {
  session: import('express-session').Session & {
    user?: {
      id: string;
      isAdmin: boolean;
    };
  };
}

// Note: express-rate-limit would need to be installed separately
// For now, this is a placeholder implementation

// Rate limiting middleware placeholder
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  // Simple in-memory rate limiter (for production, use Redis)
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, _next: NextFunction) => {
    const key = `${req.ip}:${req.url}`;
    const now = Date.now();
    const window = requests.get(key);

    if (!window || now > window.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return _next();
    }

    if (window.count >= max) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((window.resetTime - now) / 1000),
      });
    }

    window.count++;
    _next();
  };
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, _next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return _next(); // Skip validation if no API key is configured
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Invalid or missing API key',
      code: 'UNAUTHORIZED',
    });
  }

  _next();
};

// Basic authentication middleware
export const requireAuth = (req: RequestWithSession, res: Response, _next: NextFunction) => {
  if (!req.session?.user?.id) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }
  _next();
};

// Admin-only middleware
export const requireAdmin = (req: RequestWithSession, res: Response, _next: NextFunction) => {
  if (!req.session?.user?.id) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }

  if (!req.session.user.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'FORBIDDEN',
    });
  }

  _next();
};

// Input validation middleware
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, _next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Invalid input data',
          details: result.error.errors,
          code: 'VALIDATION_ERROR',
        });
      }
      req.body = result.data;
      _next();
    } catch (_error) {
      res.status(500).json({
        error: 'Internal server error during validation',
        code: 'INTERNAL_ERROR',
      });
    }
  };
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, _next: NextFunction) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove potentially sensitive headers
  res.removeHeader('X-Powered-By');

  // Content Security Policy (basic example)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
  );

  _next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, _next: NextFunction) => {
  const start = Date.now();
  const { method } = req;
  const { url } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Log format: [timestamp] method url status duration ip userAgent
    console.log(
      `[${new Date().toISOString()}] ${method} ${url} ${status} ${duration}ms ${ip} "${userAgent}"`,
    );
  });

  _next();
};

// Error handling middleware
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Default error response
  const error = {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details,
      code: 'VALIDATION_ERROR',
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
    });
  }

  res.status(500).json(error);
};

// Health check endpoint
export const healthCheck = (_req: Request, res: Response, _next: NextFunction) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    version: process.env.npm_package_version || 'unknown',
  };

  res.status(200).json(health);
};

// Not found middleware
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
};
