import UserRouter from '../routes/user.js';
import HomeRouter from '../routes/home.js';
import CourseRouter from '../routes/course.js';
import Teacher from '../routes/teacher.js';
import Admin from '../routes/admin.js';

const route = (app) => {
  app.use('/courses', CourseRouter);
  app.use('/auth', UserRouter);
  app.use('/teacher', Teacher);
  app.use('/admin', Admin);
  app.use('/', HomeRouter);
};

export default route;
