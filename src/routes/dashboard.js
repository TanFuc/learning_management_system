import express from 'express';
import authMiddleware from '../middleware/authCheck.js';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();

router.get(
  '/teacher',
  authMiddleware,
  DashboardController.showTeacherDashboard,
);

export default router;
