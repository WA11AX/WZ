import { storage } from '../storage';
import { userService } from './userService';
import { insertTournamentSchema, type Tournament, type User } from '@shared/schema';
import { z } from 'zod';

/**
 * Tournament Service
 * Contains business logic for tournament operations
 */

export class TournamentService {
  /**
   * Get all tournaments
   */
  async getAllTournaments(): Promise<Tournament[]> {
    return await storage.getTournaments();
  }

  /**
   * Get tournament by ID
   */
  async getTournamentById(id: string): Promise<Tournament | null> {
    return await storage.getTournament(id);
  }

  /**
   * Create new tournament
   */
  async createTournament(tournamentData: any): Promise<Tournament> {
    const validatedData = insertTournamentSchema.parse(tournamentData);
    return await storage.createTournament(validatedData);
  }

  /**
   * Update tournament
   */
  async updateTournament(id: string, updateData: Partial<Tournament>): Promise<Tournament | null> {
    return await storage.updateTournament(id, updateData);
  }

  /**
   * Delete tournament
   */
  async deleteTournament(id: string): Promise<boolean> {
    return await storage.deleteTournament(id);
  }

  /**
   * Register user for tournament
   */
  async registerUserForTournament(tournamentId: string, telegramId: string) {
    const user = await userService.getOrCreateUser(telegramId);
    const tournament = await storage.getTournament(tournamentId);

    if (!tournament) {
      return { success: false, message: 'Tournament not found' };
    }

    // Check if tournament is still accepting registrations
    if (tournament.status !== 'upcoming') {
      return { success: false, message: 'Tournament is no longer accepting registrations' };
    }

    // Check if user has enough stars
    if (user.stars < tournament.entryFee) {
      return { 
        success: false, 
        message: `Insufficient stars. Required: ${tournament.entryFee}, You have: ${user.stars}` 
      };
    }

    // Check if tournament is full
    if (tournament.participants.length >= tournament.maxParticipants) {
      return { success: false, message: 'Tournament is full' };
    }

    // Check if user is already registered
    if (tournament.participants.includes(user.id)) {
      return { success: false, message: 'Already registered for this tournament' };
    }

    // Deduct entry fee
    const updatedUser = await userService.deductStars(telegramId, tournament.entryFee);
    if (!updatedUser) {
      return { success: false, message: 'Failed to deduct entry fee' };
    }

    // Register user for tournament
    const success = await storage.registerForTournament(tournamentId, user.id);
    if (!success) {
      // Refund stars if registration failed
      await userService.awardStars(telegramId, tournament.entryFee);
      return { success: false, message: 'Failed to register for tournament' };
    }

    const updatedTournament = await storage.getTournament(tournamentId);
    
    return {
      success: true,
      message: 'Successfully registered for tournament',
      tournament: updatedTournament,
      user: updatedUser,
    };
  }

  /**
   * Unregister user from tournament
   */
  async unregisterUserFromTournament(tournamentId: string, telegramId: string) {
    const user = await userService.getOrCreateUser(telegramId);
    const tournament = await storage.getTournament(tournamentId);

    if (!tournament) {
      return { success: false, message: 'Tournament not found' };
    }

    // Check if tournament allows unregistration
    if (tournament.status !== 'upcoming') {
      return { success: false, message: 'Cannot unregister from tournament that has started' };
    }

    // Check if user is registered
    if (!tournament.participants.includes(user.id)) {
      return { success: false, message: 'Not registered for this tournament' };
    }

    // Unregister user
    const success = await storage.unregisterFromTournament(tournamentId, user.id);
    if (!success) {
      return { success: false, message: 'Failed to unregister from tournament' };
    }

    // Refund entry fee
    await userService.awardStars(telegramId, tournament.entryFee);

    const updatedTournament = await storage.getTournament(tournamentId);
    const updatedUser = await userService.getOrCreateUser(telegramId);
    
    return {
      success: true,
      message: 'Successfully unregistered from tournament',
      tournament: updatedTournament,
      user: updatedUser,
    };
  }

  /**
   * Get tournament participants
   */
  async getTournamentParticipants(tournamentId: string): Promise<User[] | null> {
    const tournament = await storage.getTournament(tournamentId);
    if (!tournament) {
      return null;
    }

    const participants = await Promise.all(
      tournament.participants.map(userId => storage.getUser(userId))
    );
    
    return participants.filter(Boolean) as User[];
  }

  /**
   * Start tournament (change status to active)
   */
  async startTournament(tournamentId: string): Promise<Tournament | null> {
    const tournament = await storage.getTournament(tournamentId);
    if (!tournament || tournament.status !== 'upcoming') {
      return null;
    }

    return await storage.updateTournament(tournamentId, { status: 'active' });
  }

  /**
   * Complete tournament and distribute prizes
   */
  async completeTournament(tournamentId: string, winnerId?: string): Promise<Tournament | null> {
    const tournament = await storage.getTournament(tournamentId);
    if (!tournament || tournament.status !== 'active') {
      return null;
    }

    // If there's a winner, award them the prize
    if (winnerId && tournament.participants.includes(winnerId)) {
      const winner = await storage.getUser(winnerId);
      if (winner) {
        await userService.awardStars(winner.telegramId, tournament.prize);
      }
    }

    return await storage.updateTournament(tournamentId, { 
      status: 'completed',
      // Could add winner tracking here in the future
    });
  }

  /**
   * Get tournaments by status
   */
  async getTournamentsByStatus(status: 'upcoming' | 'active' | 'completed'): Promise<Tournament[]> {
    const tournaments = await storage.getTournaments();
    return tournaments.filter(t => t.status === status);
  }

  /**
   * Get active tournaments count
   */
  async getActiveTournamentsCount(): Promise<number> {
    const activeTournaments = await this.getTournamentsByStatus('active');
    return activeTournaments.length;
  }

  /**
   * Get tournaments user can join (has enough stars, not full, upcoming)
   */
  async getJoinableTournaments(telegramId: string): Promise<Tournament[]> {
    const user = await userService.getOrCreateUser(telegramId);
    const upcomingTournaments = await this.getTournamentsByStatus('upcoming');
    
    return upcomingTournaments.filter(tournament => 
      user.stars >= tournament.entryFee &&
      tournament.participants.length < tournament.maxParticipants &&
      !tournament.participants.includes(user.id)
    );
  }
}

export const tournamentService = new TournamentService();