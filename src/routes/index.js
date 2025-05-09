import UserRouter from '../routes/user.js';
import HomeRouter from '../routes/home.js';

const route = (app) => {
  app.use('/', HomeRouter);
  app.use('/login', UserRouter);
};
export default route;
