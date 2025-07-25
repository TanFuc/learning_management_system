import express from 'express';
import AdminController from '../controllers/AdminController.js';
import AdminCourse from '../controllers/AdminCourseController.js';
import AdminLessonController from '../controllers/AdminLessonController.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// DASHBOARD
router.get('/dashboard', isAdmin, AdminController.index);

// --- USER ---
router.get('/users/soft-delete/:id', AdminController.softDeleteUser);
router.get('/users/restore/:id', AdminController.restoreUser);
router.get('/users/hard-delete/:id', AdminController.hardDeleteUser);

// [GET] /users/create
router.get('/users/create', (req, res) =>
  res.render('admin/users/create', { layout: 'admin' }),
);

router.post('/users/create', AdminController.createUser);
router.get('/users/edit/:id', AdminController.editUserForm);
router.post('/users/update/:id', AdminController.updateUser);
router.get('/users/block/:id', AdminController.blockUser);
router.get('/users/unblock/:id', AdminController.unblockUser);
router.get('/users', isAdmin, AdminController.userAdmin);

// --- COURSES ---
router.get('/courses', AdminCourse.index);
router.get('/courses/create', AdminCourse.createForm);
router.post('/courses/store', AdminCourse.create);
router.get('/courses/edit/:id', AdminCourse.editForm);
router.post('/courses/update/:id', AdminCourse.update);
router.post('/courses/delete/:id', AdminCourse.softDelete);
router.post('/courses/restore/:id', AdminCourse.restore);
router.get('/courses/duplicate/:id', AdminCourse.duplicate);
router.post('/courses/force-delete/:id', AdminCourse.hardDelete);
router.get('/courses/trash', AdminCourse.trash);

// LESSON GROUP

router.get(
  '/courses/:courseId/lesson-groups',
  AdminLessonController.listLessonGroups,
);
router.get(
  '/courses/:courseId/lesson-groups/create',
  AdminLessonController.showCreateLessonGroupForm,
);
router.post(
  '/courses/:courseId/lesson-groups/create',
  AdminLessonController.createLessonGroup,
);

// LESSON GROUP
router.get(
  '/lesson-groups/:lessonGroupId/lessons',
  AdminLessonController.listLessons,
);
router.get('/lesson-groups/:id/edit', AdminLessonController.editGroup);
router.delete('/lesson-groups/:id', AdminLessonController.deleteGroup);
router.put('/lesson-groups/:id', AdminLessonController.updateGroup);
router.get(
  '/lesson-groups/:lessonGroupId/lessons/create',
  AdminLessonController.showCreateLessonForm,
);
router.post(
  '/lesson-groups/:lessonGroupId/lessons/create',
  AdminLessonController.createLesson,
);
router.get('/lessons/:id/edit', AdminLessonController.editLesson);
router.put('/lessons/:id', AdminLessonController.updateLesson);
router.delete('/lessons/:id', AdminLessonController.deleteLesson);

export default router;
