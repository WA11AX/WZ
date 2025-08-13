import { createServer, type Server } from "http";

import { selectUserSchema, insertTournamentSchema } from "@shared/schema";
import type { Express } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

import { telegramAuthMiddleware } from "./auth";
import { telegramConfig, isDevelopment } from "./config";
import * as rateLimiters from "./rateLimiter.simple";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received:", data);
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
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

  // Apply general rate limiting to all API routes
  app.use("/api", rateLimiters.generalLimiter);

  // Telegram authentication middleware
  app.use("/api", telegramAuthMiddleware);

  // User routes
  app.get("/api/user/me", async (req, res) => {
    try {
      const { telegramUser } = req as any;
      let user = await storage.getUserByTelegramId(telegramUser.id.toString());

      if (!user) {
        // Create new user
        user = await storage.createUser({
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || `user_${telegramUser.id}`,
          firstName: telegramUser.first_name || "Telegram",
          lastName: telegramUser.last_name || "User",
          isAdmin: telegramUser.id.toString() === telegramConfig.adminId || false,
        });
      }

      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({
        message: "Failed to get user",
        error: isDevelopment ? error : undefined,
      });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", rateLimiters.generalLimiter, async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({
        message: "Failed to fetch tournaments",
        error: isDevelopment ? error : undefined,
      });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  app.post(
    "/api/tournaments",
    rateLimiters.tournamentCreationLimiter,
    rateLimiters.adminLimiter,
    async (req, res) => {
      try {
        // Check if user is admin
        const { telegramUser } = req as any;
        const user = await storage.getUserByTelegramId(telegramUser.id.toString());
        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const validatedData = insertTournamentSchema.parse(req.body);
        const tournament = await storage.createTournament(validatedData);

        // Broadcast new tournament to all clients
        broadcast({ type: "tournament_created", tournament });

        res.status(201).json(tournament);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
        }
        res.status(500).json({ message: "Failed to create tournament" });
      }
    },
  );

  app.put("/api/tournaments/:id", rateLimiters.adminLimiter, async (req, res) => {
    try {
      // Check if user is admin
      const { telegramUser } = req as any;
      const user = await storage.getUserByTelegramId(telegramUser.id.toString());
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Type-safe update - ensure status has correct type
      const updateData = {
        ...req.body,
        ...(req.body.status && {
          status: req.body.status as "upcoming" | "active" | "completed",
        }),
      };

      const tournament = await storage.updateTournament(req.params.id, updateData);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // Broadcast tournament update
      broadcast({ type: "tournament_updated", tournament });

      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tournament" });
    }
  });

  app.delete("/api/tournaments/:id", rateLimiters.adminLimiter, async (req, res) => {
    try {
      // Check if user is admin
      const { telegramUser } = req as any;
      const user = await storage.getUserByTelegramId(telegramUser.id.toString());
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteTournament(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // Broadcast tournament deletion
      broadcast({ type: "tournament_deleted", tournamentId: req.params.id });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tournament" });
    }
  });

  app.post(
    "/api/tournaments/:id/register",
    rateLimiters.tournamentRegistrationLimiter,
    async (req, res) => {
      try {
        const { telegramUser } = req as any;
        const user = await storage.getUserByTelegramId(telegramUser.id.toString());
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        const tournament = await storage.getTournament(req.params.id);
        if (!tournament) {
          return res.status(404).json({ message: "Tournament not found" });
        }

        if (user.stars < tournament.entryFee) {
          return res.status(400).json({ message: "Insufficient stars" });
        }

        if (tournament.participants.length >= tournament.maxParticipants) {
          return res.status(400).json({ message: "Tournament is full" });
        }

        const success = await storage.registerForTournament(req.params.id, user.id);
        if (!success) {
          return res.status(400).json({ message: "Already registered or tournament full" });
        }

        const updatedTournament = await storage.getTournament(req.params.id);
        const updatedUser = await storage.getUser(user.id);

        // Broadcast registration update
        broadcast({
          type: "tournament_registration",
          tournament: updatedTournament,
          userId: user.id,
        });

        res.json({
          success: true,
          tournament: updatedTournament,
          user: updatedUser,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to register for tournament" });
      }
    },
  );

  app.delete(
    "/api/tournaments/:id/register",
    rateLimiters.tournamentRegistrationLimiter,
    async (req, res) => {
      try {
        const { telegramUser } = req as any;
        const user = await storage.getUserByTelegramId(telegramUser.id.toString());
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        const success = await storage.unregisterFromTournament(req.params.id, user.id);
        if (!success) {
          return res.status(400).json({ message: "Not registered for this tournament" });
        }

        const updatedTournament = await storage.getTournament(req.params.id);
        const updatedUser = await storage.getUser(user.id);

        // Broadcast unregistration update
        broadcast({
          type: "tournament_unregistration",
          tournament: updatedTournament,
          userId: user.id,
        });

        res.json({
          success: true,
          tournament: updatedTournament,
          user: updatedUser,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to unregister from tournament" });
      }
    },
  );

  app.get("/api/tournaments/:id/participants", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      const participants = await Promise.all(
        tournament.participants.map((userId) => storage.getUser(userId)),
      );

      res.json(participants.filter(Boolean));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  return httpServer;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      telegramUser: any;
    }
  }
}