import { Router } from "express";
import { userController } from "../controllers";

const router = Router();

// User routes
router.get('/me', userController.getCurrentUser.bind(userController));
router.patch('/stars', userController.updateStars.bind(userController));

export { router as userRoutes };