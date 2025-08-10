import { Router } from 'express';
import userRoutes from './userRoutes';
import tournamentRoutes from './tournamentRoutes';

const router = Router();

/**
 * API Routes Index
 * Combines all API routes under /api prefix
 */

// User routes - /api/users
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