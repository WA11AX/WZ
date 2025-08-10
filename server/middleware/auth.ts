import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      telegramUserId: string;
    }
  }
}

/**
 * Authentication middleware for Telegram Web App
 * Validates Telegram user data and sets user ID on request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // In a real app, validate Telegram Web App data here
    // For now, we'll create a mock user if none exists
    const telegramId = req.headers['x-telegram-user-id'] as string || 'mock-user';
    
    if (!telegramId) {
      return res.status(401).json({ message: 'Unauthorized: No Telegram user ID' });
    }
    
    req.telegramUserId = telegramId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
}

/**
 * Admin authorization middleware
 * Requires user to be authenticated and have admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // This will be enhanced when we add the user service
  // For now, just check if it's the mock user
  if (req.telegramUserId === 'mock-user') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
}