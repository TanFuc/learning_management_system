import UserRouter from '../routes/user.js';
import HomeRouter from '../routes/home.js';
import CourseRouter from '../routes/course.js';
import Dashboard from '../routes/dashboard.js';

const route = (app) => {
  app.use('/courses', CourseRouter);
  app.use('/auth', UserRouter);
  app.use('/dashboard', Dashboard);
  app.use('/', HomeRouter);
};

export default route;
