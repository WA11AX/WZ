import { storage } from "../storage";
import type { User, InsertUser } from "@shared/schema";

/**
 * User service for business logic related to users
 */
export class UserService {
  /**
   * Get user by Telegram ID, create if doesn't exist
   */
  async getOrCreateUser(telegramId: string): Promise<User> {
    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      // Create new user with default values
      const newUserData: InsertUser = {
        telegramId,
        username: `user_${telegramId}`,
        firstName: 'Telegram',
        lastName: 'User',
        isAdmin: telegramId === 'mock-user', // Make mock user admin for development
      };
      
      user = await storage.createUser(newUserData);
    }
    
    return user;
  }

  /**
   * Get user by Telegram ID
   */
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    const user = await storage.getUserByTelegramId(telegramId);
    return user || null;
  }

  /**
   * Update user stars balance
   */
  async updateUserStars(telegramId: string, starsChange: number): Promise<User | null> {
    const user = await this.getUserByTelegramId(telegramId);
    if (!user) return null;

    const newStars = Math.max(0, user.stars + starsChange);
    const updatedUser = await storage.updateUser(user.id, { stars: newStars });
    return updatedUser || null;
  }

  /**
   * Check if user has admin privileges
   */
  async isAdmin(telegramId: string): Promise<boolean> {
    const user = await this.getUserByTelegramId(telegramId);
    return user?.isAdmin ?? false;
  }
}

// Export singleton instance
export const userService = new UserService();