/**
 * Database Models
 * Type definitions and schemas for database entities
 */

import type { 
  User, 
  Tournament, 
  InsertUser, 
  InsertTournament 
} from '@shared/schema';

// Re-export types for consistency
export type { User, Tournament, InsertUser, InsertTournament };

// Additional model types for internal use
export interface UserStats {
  totalStars: number;
  tournamentsJoined: number;
  tournamentsCompleted: number;
  winRate: number;
}

export interface TournamentRegistrationResult {
  success: boolean;
  message: string;
  tournament?: Tournament;
  user?: User;
}

export interface DatabaseUser extends User {
  // Add any database-specific fields here
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseTournament extends Tournament {
  // Add any database-specific fields here
  createdAt: Date;
  updatedAt: Date;
}

// Utility types for partial updates
export type UserUpdate = Partial<Omit<User, 'id' | 'telegramId' | 'createdAt'>>;
export type TournamentUpdate = Partial<Omit<Tournament, 'id' | 'createdAt'>>;

// Query filter types
export interface UserFilters {
  isAdmin?: boolean;
  minStars?: number;
  maxStars?: number;
}

export interface TournamentFilters {
  status?: 'upcoming' | 'active' | 'completed';
  minEntryFee?: number;
  maxEntryFee?: number;
  minPrize?: number;
  maxPrize?: number;
  hasSpots?: boolean; // Tournaments with available spots
}