import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { userRoutes } from "./userRoutes";
import { tournamentRoutes } from "./tournamentRoutes";

const router = Router();

// Apply authentication middleware to all API routes
router.use(authMiddleware);

// Mount route modules
router.use('/user', userRoutes);
router.use('/tournaments', tournamentRoutes);

export { router as apiRoutes };