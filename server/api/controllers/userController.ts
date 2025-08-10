import type { Request, Response } from 'express';
import { userService } from '../services/userService';

/**
 * User Controller
 * Handles all user-related HTTP requests
 */

export class UserController {
  /**
   * Get current user profile
   */
  static async getMe(req: Request, res: Response) {
    try {
      const user = await userService.getOrCreateUser(req.telegramUserId);
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(req.telegramUserId, req.body);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  }

  /**
   * Get user statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await userService.getUserStats(req.telegramUserId);
      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ message: 'Failed to get user statistics' });
    }
  }

  /**
   * Get user tournament history
   */
  static async getTournamentHistory(req: Request, res: Response) {
    try {
      const history = await userService.getTournamentHistory(req.telegramUserId);
      res.json(history);
    } catch (error) {
      console.error('Error getting tournament history:', error);
      res.status(500).json({ message: 'Failed to get tournament history' });
    }
  }
}