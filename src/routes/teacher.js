import express from 'express';
import authMiddleware from '../middleware/authCheck.js';
import TeacherController from '../controllers/TeacherController.js';

const router = express.Router();

router.get('/teacher', authMiddleware, TeacherController.index);

export default router;
