import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import apiRoutes from "./api/routes";

/**
 * Enhanced Routes Registration
 * Uses new controller and service architecture
 */

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Make broadcast function available globally for controllers
  (global as any).broadcast = broadcast;

  // Authentication middleware for all API routes
  app.use('/api', (req, res, next) => {
    // In a real app, validate Telegram Web App data here
    // For now, we'll create a mock user if none exists
    const telegramId = req.headers['x-telegram-user-id'] as string || 'mock-user';
    req.telegramUserId = telegramId;
    next();
  });

  // Register all API routes
  app.use('/api', apiRoutes);

  return httpServer;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      telegramUserId: string;
    }
  }
}