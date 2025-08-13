import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertTournamentSchema } from "@shared/schema";
import { z } from "zod";
import { supabase } from "./supabase";

// Simple rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

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
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Authentication middleware
  app.use('/api', (req, res, next) => {
    // Extract Telegram Web App init data from headers
    const initData = req.headers['x-telegram-init-data'] as string;
    const telegramId = req.headers['x-telegram-user-id'] as string || 'mock-user';
    
    // TODO: In production, validate initData signature using bot token
    // const isValid = validateTelegramWebAppData(initData, process.env.BOT_TOKEN);
    // if (!isValid) {
    //   return res.status(401).json({ message: 'Invalid Telegram data' });
    // }
    
    req.telegramUserId = telegramId;
    next();
  });

  // Health check for Supabase
  app.get('/api/health', async (req, res) => {
    const status = {
      database: false,
      supabase: false,
      supabaseUrl: process.env.SUPABASE_URL || 'Not configured',
      hasApiKey: !!process.env.SUPABASE_ANON_KEY
    };
    
    // Check database connection
    try {
      await storage.getTournaments();
      status.database = true;
    } catch (error) {
      console.error('Database check failed:', error);
    }
    
    // Check Supabase client
    if (supabase) {
      try {
        const { data, error } = await supabase.from('tournaments').select('count').limit(1);
        if (!error) {
          status.supabase = true;
        }
      } catch (error) {
        console.error('Supabase check failed:', error);
      }
    }
    
    res.json(status);
  });

  // User routes
  app.get('/api/user/me', async (req, res) => {
    try {
      let user = await storage.getUserByTelegramId(req.telegramUserId);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          telegramId: req.telegramUserId,
          username: `user_${req.telegramUserId}`,
          firstName: 'Telegram',
          lastName: 'User',
          isAdmin: req.telegramUserId === 'mock-user', // Make mock user admin
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ 
        message: 'Failed to get user',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Tournament routes
  app.get('/api/tournaments', async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ 
        message: 'Failed to fetch tournaments',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  app.get('/api/tournaments/:id', async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tournament' });
    }
  });

  app.post('/api/tournaments', async (req, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUserByTelegramId(req.telegramUserId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      
      // Broadcast new tournament to all clients
      broadcast({ type: 'tournament_created', tournament });
      
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid tournament data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create tournament' });
    }
  });

  app.put('/api/tournaments/:id', async (req, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUserByTelegramId(req.telegramUserId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const tournament = await storage.updateTournament(req.params.id, req.body);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      
      // Broadcast tournament update
      broadcast({ type: 'tournament_updated', tournament });
      
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update tournament' });
    }
  });

  app.delete('/api/tournaments/:id', async (req, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUserByTelegramId(req.telegramUserId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const success = await storage.deleteTournament(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      
      // Broadcast tournament deletion
      broadcast({ type: 'tournament_deleted', tournamentId: req.params.id });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete tournament' });
    }
  });

  app.post('/api/tournaments/:id/register', async (req, res) => {
    try {
      const user = await storage.getUserByTelegramId(req.telegramUserId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      if (user.stars < tournament.entryFee) {
        return res.status(400).json({ message: 'Insufficient stars' });
      }

      if (tournament.participants.length >= tournament.maxParticipants) {
        return res.status(400).json({ message: 'Tournament is full' });
      }

      const success = await storage.registerForTournament(req.params.id, user.id);
      if (!success) {
        return res.status(400).json({ message: 'Already registered or tournament full' });
      }

      const updatedTournament = await storage.getTournament(req.params.id);
      const updatedUser = await storage.getUser(user.id);
      
      // Broadcast registration update
      broadcast({ 
        type: 'tournament_registration', 
        tournament: updatedTournament,
        userId: user.id
      });
      
      res.json({ 
        success: true, 
        tournament: updatedTournament,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to register for tournament' });
    }
  });

  app.delete('/api/tournaments/:id/register', async (req, res) => {
    try {
      const user = await storage.getUserByTelegramId(req.telegramUserId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const success = await storage.unregisterFromTournament(req.params.id, user.id);
      if (!success) {
        return res.status(400).json({ message: 'Not registered for this tournament' });
      }

      const updatedTournament = await storage.getTournament(req.params.id);
      const updatedUser = await storage.getUser(user.id);
      
      // Broadcast unregistration update
      broadcast({ 
        type: 'tournament_unregistration', 
        tournament: updatedTournament,
        userId: user.id
      });
      
      res.json({ 
        success: true, 
        tournament: updatedTournament,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to unregister from tournament' });
    }
  });

  app.get('/api/tournaments/:id/participants', async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      const participants = await Promise.all(
        tournament.participants.map(userId => storage.getUser(userId))
      );
      
      res.json(participants.filter(Boolean));
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch participants' });
    }
  });

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
