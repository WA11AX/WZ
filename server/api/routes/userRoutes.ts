import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

/**
 * User Routes
 * @route /api/users
 */

// Get current user profile
router.get('/me', UserController.getMe);

// Update user profile
router.put('/me', UserController.updateProfile);

// Get user statistics
router.get('/me/stats', UserController.getStats);

// Get user tournament history
router.get('/me/tournaments', UserController.getTournamentHistory);

export default router;