import { Router } from "express";
import { tournamentController } from "../controllers";

const router = Router();

// Tournament routes
router.get('/', tournamentController.getAllTournaments.bind(tournamentController));
router.get('/:id', tournamentController.getTournamentById.bind(tournamentController));
router.post('/', tournamentController.createTournament.bind(tournamentController));
router.post('/:id/join', tournamentController.joinTournament.bind(tournamentController));
router.patch('/:id/status', tournamentController.updateTournamentStatus.bind(tournamentController));

export { router as tournamentRoutes };