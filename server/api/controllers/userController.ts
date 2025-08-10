import type { Request, Response } from "express";
import { userService } from "../../services";

/**
 * User controller for handling user-related API endpoints
 */
export class UserController {
  /**
   * GET /api/user/me - Get current user profile
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await userService.getOrCreateUser(req.telegramUserId);
      res.json(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  }

  /**
   * PATCH /api/user/stars - Update user stars (for payments)
   */
  async updateStars(req: Request, res: Response) {
    try {
      const { starsChange } = req.body;
      
      if (typeof starsChange !== 'number') {
        return res.status(400).json({ message: 'Invalid stars change value' });
      }

      const user = await userService.updateUserStars(req.telegramUserId, starsChange);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error updating user stars:', error);
      res.status(500).json({ message: 'Failed to update stars' });
    }
  }
}

// Export singleton instance
export const userController = new UserController();