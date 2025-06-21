import express from 'express';
import TeacherController from '../controllers/TeacherController.js';
import TeacherCourseController from '../controllers/TeacherCourseController.js';
import TeacherLessonController from '../controllers/TeacherLessonController.js';

const router = express.Router();

router.get('/dashboard', TeacherController.index);
router.get('/courses', TeacherCourseController.showCourses);
router.get('/courses/create', TeacherCourseController.createForm);
router.post('/courses/create', TeacherCourseController.create);
router.get('/courses/edit/:id', TeacherCourseController.editCourse);
router.get('/courses/duplicate/:id', TeacherCourseController.duplicate);
router.post('/courses/update/:id', TeacherCourseController.updateCourse);
router.delete('/courses/delete/:id', TeacherCourseController.softDelete);

router.get(
  '/courses/:courseId/lesson-groups',
  TeacherLessonController.listLessonGroups,
);
router.get(
  '/courses/:courseId/lesson-groups/create',
  TeacherLessonController.showCreateLessonGroupForm,
);
router.post(
  '/courses/:courseId/lesson-groups/create',
  TeacherLessonController.createLessonGroup,
);

// LESSON GROUP
router.get(
  '/lesson-groups/:lessonGroupId/lessons',
  TeacherLessonController.listLessons,
);
router.get('/lesson-groups/:id/edit', TeacherLessonController.editGroup);
router.delete('/lesson-groups/:id', TeacherLessonController.deleteGroup);
router.put('/lesson-groups/:id', TeacherLessonController.updateGroup);
router.get(
  '/lesson-groups/:lessonGroupId/lessons/create',
  TeacherLessonController.showCreateLessonForm,
);
router.post(
  '/lesson-groups/:lessonGroupId/lessons/create',
  TeacherLessonController.createLesson,
);
router.get('/lessons/:id/edit', TeacherLessonController.editLesson);
router.put('/lessons/:id', TeacherLessonController.updateLesson);
router.delete('/lessons/:id', TeacherLessonController.deleteLesson);

export default router;
