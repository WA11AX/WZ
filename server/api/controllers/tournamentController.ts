import type { Request, Response } from "express";
import { tournamentService, userService } from "../../services";
import { insertTournamentSchema } from "@shared/schema";
import { z } from "zod";

/**
 * Tournament controller for handling tournament-related API endpoints
 */
export class TournamentController {
  /**
   * GET /api/tournaments - Get all tournaments
   */
  async getAllTournaments(req: Request, res: Response) {
    try {
      const tournaments = await tournamentService.getAllTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch tournaments' });
    }
  }

  /**
   * GET /api/tournaments/:id - Get tournament by ID
   */
  async getTournamentById(req: Request, res: Response) {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);
      
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      res.json(tournament);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      res.status(500).json({ message: 'Failed to fetch tournament' });
    }
  }

  /**
   * POST /api/tournaments - Create new tournament (admin only)
   */
  async createTournament(req: Request, res: Response) {
    try {
      // Check if user is admin
      const isAdmin = await userService.isAdmin(req.telegramUserId);
      if (!isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      // Validate request body
      const tournamentData = insertTournamentSchema.parse(req.body);
      
      const tournament = await tournamentService.createTournament(tournamentData);
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid tournament data', 
          errors: error.errors 
        });
      }
      
      console.error('Error creating tournament:', error);
      res.status(500).json({ message: 'Failed to create tournament' });
    }
  }

  /**
   * POST /api/tournaments/:id/join - Join tournament
   */
  async joinTournament(req: Request, res: Response) {
    try {
      const tournamentId = req.params.id;
      const userId = req.telegramUserId;

      // Check if user can join tournament
      const canJoin = await tournamentService.canUserJoinTournament(tournamentId, userId);
      if (!canJoin) {
        return res.status(400).json({ message: 'Cannot join this tournament' });
      }

      const success = await tournamentService.joinTournament(tournamentId, userId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to join tournament' });
      }

      res.json({ success: true, message: 'Successfully joined tournament' });
    } catch (error) {
      console.error('Error joining tournament:', error);
      res.status(500).json({ message: 'Failed to join tournament' });
    }
  }

  /**
   * PATCH /api/tournaments/:id/status - Update tournament status (admin only)
   */
  async updateTournamentStatus(req: Request, res: Response) {
    try {
      // Check if user is admin
      const isAdmin = await userService.isAdmin(req.telegramUserId);
      if (!isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { status } = req.body;
      const validStatuses = ['upcoming', 'active', 'completed'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const tournament = await tournamentService.updateTournamentStatus(
        req.params.id, 
        status
      );

      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      res.json(tournament);
    } catch (error) {
      console.error('Error updating tournament status:', error);
      res.status(500).json({ message: 'Failed to update tournament status' });
    }
  }
}

// Export singleton instance
export const tournamentController = new TournamentController();