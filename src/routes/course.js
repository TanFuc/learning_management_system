import express from 'express';
import CourseController from '../controllers/CourseController.js';

const router = express.Router();

router.get('/', CourseController.index);
router.get('/:slug/lessons/:lessonId', CourseController.showLesson);
router.get('/:slug/lessons', CourseController.showLesson);
router.get('/:slug', CourseController.show);

export default router;
