import { storage } from '../../storage';
import type { User } from '@shared/schema';

/**
 * User Service
 * Contains business logic for user operations
 */

export class UserService {
  /**
   * Get user by telegram ID or create if doesn't exist
   */
  async getOrCreateUser(telegramId: string): Promise<User> {
    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      // Create new user with default values
      user = await storage.createUser({
        telegramId,
        username: `user_${telegramId}`,
        firstName: 'Telegram',
        lastName: 'User',
        isAdmin: telegramId === 'mock-user', // Make mock user admin for development
        stars: 100, // Give new users some starting stars
      });
    }
    
    return user;
  }

  /**
   * Update user information
   */
  async updateUser(telegramId: string, updateData: Partial<User>): Promise<User | null> {
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return null;
    }

    // Don't allow updating certain fields through this method
    const { id, telegramId: _, createdAt, ...allowedUpdates } = updateData;
    
    return await storage.updateUser(user.id, allowedUpdates);
  }

  /**
   * Get user statistics
   */
  async getUserStats(telegramId: string) {
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get tournament participation stats
    const tournaments = await storage.getTournaments();
    const participatedTournaments = tournaments.filter(t => 
      t.participants.includes(user.id)
    );

    const completedTournaments = participatedTournaments.filter(t => 
      t.status === 'completed'
    );

    return {
      totalStars: user.stars,
      tournamentsJoined: participatedTournaments.length,
      tournamentsCompleted: completedTournaments.length,
      winRate: completedTournaments.length > 0 ? 
        (completedTournaments.length / participatedTournaments.length) * 100 : 0,
    };
  }

  /**
   * Get user tournament history
   */
  async getTournamentHistory(telegramId: string) {
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      throw new Error('User not found');
    }

    const tournaments = await storage.getTournaments();
    const userTournaments = tournaments.filter(t => 
      t.participants.includes(user.id)
    );

    // Sort by date (most recent first)
    return userTournaments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Award stars to user
   */
  async awardStars(telegramId: string, amount: number): Promise<User | null> {
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return null;
    }

    const newStarsAmount = Math.max(0, user.stars + amount);
    return await storage.updateUser(user.id, { stars: newStarsAmount });
  }

  /**
   * Deduct stars from user
   */
  async deductStars(telegramId: string, amount: number): Promise<User | null> {
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user || user.stars < amount) {
      return null;
    }

    return await storage.updateUser(user.id, { stars: user.stars - amount });
  }

  /**
   * Check if user has enough stars
   */
  async hasEnoughStars(telegramId: string, amount: number): Promise<boolean> {
    const user = await storage.getUserByTelegramId(telegramId);
    return user ? user.stars >= amount : false;
  }

  /**
   * Check if user is admin
   */
  async isAdmin(telegramId: string): Promise<boolean> {
    const user = await storage.getUserByTelegramId(telegramId);
    return user?.isAdmin || false;
  }
}

export const userService = new UserService();