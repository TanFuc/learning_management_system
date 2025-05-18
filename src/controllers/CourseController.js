import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import LessonGroup from '../models/LessonGroup.js';
import { multipleToObject, toObject } from '../utils/mongoose.js';

const CourseController = {
  // [GET] /courses
  async index(req, res, next) {
    try {
      const courses = await Course.find({ isPublished: true, deleted: false })
        .populate('teacher', 'username')
        .lean();

      res.render('students/courses/index', {
        courses,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      console.log(error);
    }
  },
  // [GET] /courses/:slug
  async show(req, res, next) {
    try {
      const slug = req.params.slug;
      const course = await Course.findOne({
        slug,
        isPublished: true,
        deleted: false,
      });
      if (!course) return res.status(404).send('Khóa học không tồn tại');

      const lessons = await Lesson.find({ course: course._id }).sort('order');

      let LessonGroupIds = [];
      if (req.user) {
        const watched = await LessonGroup.find({
          user: req.user._id,
          course: course._id,
        });
        LessonGroupIds = watched.map((w) => w.lesson.toString());
      }

      res.render('students/courses/show', {
        course: toObject(course),
        lessons: multipleToObject(lessons),
        LessonGroupIds,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  },

  // [GET] /courses/:slug/lessons/:lessonId
  async lesson(req, res, next) {
    try {
      const { slug, lessonId } = req.params;
      const course = await Course.findOne({ slug });
      if (!course) return res.status(404).send('Khóa học không tồn tại');

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) return res.status(404).send('Bài học không tồn tại');

      res.render('courses/lesson', {
        course,
        lesson,
        currentUrl: req.originalUrl,
      });
      res.render('students/courses/show')
    } catch (error) {
      next(error);
    }
  },

  // [POST] /courses/lessons/:lessonId/watch
  async markWatched(req, res, next) {
    try {
      const lessonId = req.params.lessonId;
      const userId = req.user._id;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson)
        return res
          .status(404)
          .json({ success: false, message: 'Bài học không tồn tại' });

      const exists = await LessonGroup.findOne({
        user: userId,
        lesson: lessonId,
      });
      if (!exists) {
        await LessonGroup.create({
          user: userId,
          course: lesson.course,
          lesson: lesson._id,
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

async showCourse(req, res) {
  try {
    const course = await Course.findOne({ slug: req.params.slug, deleted: false })
      .populate('teacher', 'username email')
      .lean();
    if (!course) return res.status(404).send('Khóa học không tồn tại');

    const lessonGroups = await LessonGroup.find({ course: course._id }).lean();
    for (const group of lessonGroups) {
      const lessons = await Lesson.find({ lessonGroup: group._id }).sort('order').lean();
      group.lessons = lessons;
    }

    res.render('students/courses/show', { course, lessonGroups });
  } catch (error) {
    res.status(500).send('Lỗi máy chủ');
  }
},

async learnCourse(req, res) {
  try {
    const course = await Course.findOne({ slug: req.params.slug, deleted: false })
      .populate('teacher', 'username email')
      .lean();
    if (!course) return res.status(404).send('Khóa học không tồn tại');

    const lessonGroups = await LessonGroup.find({ course: course._id }).lean();
    for (const group of lessonGroups) {
      const lessons = await Lesson.find({ lessonGroup: group._id }).sort('order').lean();
      group.lessons = lessons;
    }

    res.render('courses/learn', { course, lessonGroups });
  } catch (error) {
    res.status(500).send('Lỗi máy chủ');
  }
},
};

export default CourseController;
