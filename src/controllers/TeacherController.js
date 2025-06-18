import User from '../models/User.js';
import Course from '../models/Course.js';

const TeacherController = {
  index(req, res) {
    res.render('teachers/index', { layout: 'teacher' });
  },
};

export default TeacherController;
