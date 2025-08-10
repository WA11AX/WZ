import type { Request, Response } from 'express';
import { tournamentService } from '../services/tournamentService';
import { z } from 'zod';

/**
 * Tournament Controller
 * Handles all tournament-related HTTP requests
 */

export class TournamentController {
  /**
   * Get all tournaments
   */
  static async getAllTournaments(req: Request, res: Response) {
    try {
      const tournaments = await tournamentService.getAllTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch tournaments' });
    }
  }

  /**
   * Get tournament by ID
   */
  static async getTournament(req: Request, res: Response) {
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
   * Create new tournament (Admin only)
   */
  static async createTournament(req: Request, res: Response) {
    try {
      const tournament = await tournamentService.createTournament(req.body);
      res.status(201).json(tournament);
    } catch (error) {
      console.error('Error creating tournament:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid tournament data', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to create tournament' });
    }
  }

  /**
   * Update tournament (Admin only)
   */
  static async updateTournament(req: Request, res: Response) {
    try {
      const tournament = await tournamentService.updateTournament(req.params.id, req.body);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      res.json(tournament);
    } catch (error) {
      console.error('Error updating tournament:', error);
      res.status(500).json({ message: 'Failed to update tournament' });
    }
  }

  /**
   * Delete tournament (Admin only)
   */
  static async deleteTournament(req: Request, res: Response) {
    try {
      const success = await tournamentService.deleteTournament(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      res.status(500).json({ message: 'Failed to delete tournament' });
    }
  }

  /**
   * Register user for tournament
   */
  static async registerForTournament(req: Request, res: Response) {
    try {
      const result = await tournamentService.registerUserForTournament(
        req.params.id, 
        req.telegramUserId
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error registering for tournament:', error);
      res.status(500).json({ message: 'Failed to register for tournament' });
    }
  }

  /**
   * Unregister user from tournament
   */
  static async unregisterFromTournament(req: Request, res: Response) {
    try {
      const result = await tournamentService.unregisterUserFromTournament(
        req.params.id, 
        req.telegramUserId
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      res.status(500).json({ message: 'Failed to unregister from tournament' });
    }
  }

  /**
   * Get tournament participants
   */
  static async getTournamentParticipants(req: Request, res: Response) {
    try {
      const participants = await tournamentService.getTournamentParticipants(req.params.id);
      if (participants === null) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      res.json(participants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({ message: 'Failed to fetch participants' });
    }
  }
}