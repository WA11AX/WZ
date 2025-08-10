import { Router } from 'express';
import { TournamentController } from '../controllers/tournamentController';
import { validateInput } from '../../middleware/auth';
import { insertTournamentSchema } from '@shared/schema';

const router = Router();

/**
 * Tournament Routes
 * @route /api/tournaments
 */

// Get all tournaments
router.get('/', TournamentController.getAllTournaments);

// Get tournament by ID
router.get('/:id', TournamentController.getTournament);

// Create new tournament (Admin only)
router.post('/', 
  validateInput(insertTournamentSchema),
  TournamentController.createTournament
);

// Update tournament (Admin only)  
router.put('/:id', TournamentController.updateTournament);

// Delete tournament (Admin only)
router.delete('/:id', TournamentController.deleteTournament);

// Register for tournament
router.post('/:id/register', TournamentController.registerForTournament);

// Unregister from tournament
router.delete('/:id/register', TournamentController.unregisterFromTournament);

// Get tournament participants
router.get('/:id/participants', TournamentController.getTournamentParticipants);

export default router;