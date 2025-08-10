import { storage } from "../storage";
import type { Tournament, InsertTournament } from "@shared/schema";

/**
 * Tournament service for business logic related to tournaments
 */
export class TournamentService {
  /**
   * Get all tournaments
   */
  async getAllTournaments(): Promise<Tournament[]> {
    return storage.getTournaments();
  }

  /**
   * Get tournament by ID
   */
  async getTournamentById(id: string): Promise<Tournament | null> {
    const tournament = await storage.getTournament(id);
    return tournament || null;
  }

  /**
   * Create new tournament (admin only)
   */
  async createTournament(data: InsertTournament): Promise<Tournament> {
    return storage.createTournament(data);
  }

  /**
   * Join tournament
   */
  async joinTournament(tournamentId: string, userId: string): Promise<boolean> {
    try {
      const tournament = await this.getTournamentById(tournamentId);
      if (!tournament) return false;

      // Check if tournament is accepting participants
      if (tournament.status !== 'upcoming') return false;

      // Use existing registration method
      return storage.registerForTournament(tournamentId, userId);
    } catch (error) {
      console.error('Error joining tournament:', error);
      return false;
    }
  }

  /**
   * Update tournament status
   */
  async updateTournamentStatus(
    tournamentId: string, 
    status: 'upcoming' | 'active' | 'completed'
  ): Promise<Tournament | null> {
    try {
      const tournament = await storage.updateTournament(tournamentId, { status });
      return tournament || null;
    } catch (error) {
      console.error('Error updating tournament status:', error);
      return null;
    }
  }

  /**
   * Check if user can join tournament
   */
  async canUserJoinTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) return false;

    // Check if tournament is accepting participants
    if (tournament.status !== 'upcoming') return false;

    // Check if user is already a participant
    const isParticipant = tournament.participants.includes(userId);
    if (isParticipant) return false;

    return true;
  }
}

// Export singleton instance
export const tournamentService = new TournamentService();