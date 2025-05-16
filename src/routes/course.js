import express from 'express';
import CourseController from '../controllers/CourseController.js';

const router = express.Router();

router.get('/', CourseController.index);
router.get('/courses/:slug', CourseController.showCourse);
router.get('/courses/:slug/learn', CourseController.learnCourse);
router.post('/lessons/:lessonId/watch', CourseController.markWatched);


export default router;
