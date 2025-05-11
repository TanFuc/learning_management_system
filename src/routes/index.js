import UserRouter from '../routes/user.js';
import HomeRouter from '../routes/home.js';
import CourseRouter from '../routes/course.js';

const route = (app) => {
  app.use('/courses', CourseRouter);
  app.use('/login', UserRouter);
  app.use('/', HomeRouter);
};
export default route;
