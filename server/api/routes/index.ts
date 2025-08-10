import { Router } from 'express';
import userRoutes from './userRoutes';
import tournamentRoutes from './tournamentRoutes';

const router = Router();

/**
 * API Routes Index
 * Maintains backward compatibility with existing API paths
 */

// User routes - /api/user (legacy path for compatibility)
router.use('/user', userRoutes);

// Users routes - /api/users (new REST-style path)
router.use('/users', userRoutes);

// Tournament routes - /api/tournaments  
router.use('/tournaments', tournamentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
  });
});

export default router;