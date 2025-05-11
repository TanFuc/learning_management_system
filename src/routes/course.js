import express from 'express';
import CourseController from '../controllers/CourseController.js';

const router = express.Router();

router.delete('/:id', CourseController.delete);
router.put('/:id', CourseController.update);
router.get('/create', CourseController.create);
router.post('/store', CourseController.store);
router.get('/:id/edit', CourseController.edit);
router.get('/:slug', CourseController.show);
router.get('/', CourseController.index);

export default router;
