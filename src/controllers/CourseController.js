import Course from '../models/Course.js';
import { multipleToObject, toObject } from '../utils/mongoose.js';

const CourseController = {
  // [GET] /courses
  async index(req, res, next) {
    try {
      const courses = await Course.find({ deleted: false });
      res.render('courses/index', {
        courses: multipleToObject(courses),
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  },

  // [POST] /create
  create(req, res) {
    res.render('courses/create');
  },

  // [GET] /show
  show(req, res, next) {
    Course.findOne({ slug: req.params.slug })
      .then((course) => {
        console.log(course);
        res.render('courses/show', {
          course: toObject(course),
        });
      })
      .catch((err) => next(err));
  },

  // [POST]
  async store(req, res, next) {
    try {
      const { name, description, image, isFree, isPublished } = req.body;

      const courseData = {
        name,
        description,
        image,
        isFree: isFree === 'on',
        isPublished: isPublished === 'on',
      };

      const course = new Course(courseData);
      await course.save();

      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  },

  // [PUT]
  async edit(req, res, next) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).send('Không tìm thấy khóa học');
      }
      res.render('courses/edit', { course: course.toObject() });
    } catch (error) {
      next(error);
    }
  },
  // [PUT] /courses/:id
  async update(req, res, next) {
    try {
      await Course.updateOne({ _id: req.params.id }, req.body);
      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  },
  // [DELETE] /courses/:id
  async delete(req, res, next) {
    try {
      await Course.updateOne({ _id: req.params.id }, { deleted: true });
      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  },
  // [PATCH] /courses/:id/restore
  async restore(req, res, next) {
    try {
      await Course.updateOne({ _id: req.params.id }, { deleted: false });
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  },
  async duplicate(req, res, next) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const duplicateCourse = new Course({
        ...course.toObject(),
        name: `${course.name} (Copy)`,
        slug: `${course.slug}-copy`,
        _id: undefined,
      });

      await duplicateCourse.save();

      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  },
};

export default CourseController;
