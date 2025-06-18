import Course from '../models/Course.js';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import LessonGroup from '../models/LessonGroup.js';
import { multipleToObject, toObject } from '../utils/mongoose.js';

const CourseController = {
  // [GET] /courses
  async index(req, res, next) {
    try {
      const query = {};
      const { search, price, teacher } = req.query;

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      if (price === 'free') {
        query.price = 0;
      } else if (price === 'paid') {
        query.price = { $gt: 0 };
      }

      if (teacher) {
        query.teacher = teacher;
      }

      query.isPublished = true;
      query.deleted = false;

      const [courses, teachers] = await Promise.all([
        Course.find(query).populate('teacher', 'username').lean(),
        User.find({ role: 'teacher' }).select('username').lean(),
      ]);

      res.render('students/courses/index', {
        courses,
        teachers,
        query: req.query,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  },
  // [GET] /courses/:slug
  async show(req, res, next) {
    try {
      const slug = req.params.slug;
      const lessonId = req.params.lessonId;
      const course = await Course.findOne({
        slug,
        isPublished: true,
        deleted: false,
      }).lean();

      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const lessonGroups = await LessonGroup.find({
        course: course._id,
      }).lean();

      const lessonGroupsWithLessons = await Promise.all(
        lessonGroups.map(async (group) => {
          const lessons = await Lesson.find({ lessonGroup: group._id })
            .sort({ order: 1 })
            .lean();
          return {
            ...group,
            lessons,
          };
        }),
      );

      let learnedLessonIds = [];
      if (req.user) {
        const watchedLessons = await LessonGroup.find({
          user: req.user._id,
          course: course._id,
        });
        learnedLessonIds = watchedLessons.map((w) => w.lesson?.toString());
      }

      res.render('students/courses/detail', {
        course,
        lessonGroups: lessonGroupsWithLessons,
        learnedLessonIds,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  },

  // [GET] /courses/:slug/lessons/:lessonId
  async showLesson(req, res, next) {
    try {
      const slug = req.params.slug;
      const lessonId = req.params.lessonId;

      const course = await Course.findOne({
        slug,
        isPublished: true,
        deleted: false,
      }).lean();

      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const lessonGroups = await LessonGroup.find({
        course: course._id,
      }).lean();

      const lessonGroupsWithLessons = await Promise.all(
        lessonGroups.map(async (group) => {
          const lessons = await Lesson.find({ lessonGroup: group._id })
            .sort({ order: 1 })
            .lean();
          return { ...group, lessons };
        }),
      );

      let currentLesson = null;
      if (lessonId) {
        currentLesson = await Lesson.findById(lessonId).lean();
      }

      res.render('students/courses/lesson', {
        course,
        lessonGroups: lessonGroupsWithLessons,
        currentLesson,
      });
    } catch (err) {
      next(err);
    }
  },

  // [GET] /courses/:slug/start-learning
  starLearning(req, res) {
    if (!req.user) {
      return res.redirect(
        `/login?redirect=/courses/${req.params.slug}/lessons`,
      );
    }

    res.redirect(`/courses/${req.params.slug}/lessons`);
  },
};

export default CourseController;
