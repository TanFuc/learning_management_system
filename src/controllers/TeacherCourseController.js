import User from '../models/User.js';
import Course from '../models/Course.js';
import extractVideoId from '../utils/extractVideo.js';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

const TeacherCourseController = {
  async showCourses(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const offset = (page - 1) * limit;

      const currentUserId = req.user.id;

      const query = {
        deleted: false,
        teacher: currentUserId,
        name: { $regex: keyword, $options: 'i' },
      };

      console.log(req.user);

      const [courses, total] = await Promise.all([
        Course.find(query).populate('teacher').skip(skip).limit(limit).lean(),
        Course.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('teachers/courses/index', {
        layout: 'teacher',
        courses,
        currentPage: page,
        totalPages,
        keyword,
        offset,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'teacher' });
    }
  },

  async createForm(req, res) {
    try {
      res.render('teachers/courses/create', {
        layout: 'teacher',
        course: {},
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'teacher' });
    }
  },

  async create(req, res) {
    try {
      const {
        name,
        description,
        image,
        videoId,
        level,
        duration,
        price,
        tags,
        isPublished,
      } = req.body;

      const course = new Course({
        name,
        description,
        image,
        videoId: extractVideoId(videoId),
        level,
        duration,
        price: Number(price) || 0,
        tags: tags?.split(',').map((tag) => tag.trim()),
        teacher: req.user.id,
        isFree: !price || Number(price) === 0,
        isPublished: isPublished === 'on',
      });

      await course.save();
      res.redirect('/teacher/courses');
    } catch (err) {
      console.error('Lỗi tạo khóa học:', err);
      res.status(500).render('errors/500', { layout: 'teacher' });
    }
  },

  async editCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id).lean();
      if (!course)
        return res.status(404).render('errors/500', { layout: 'teacher' });

      const teachers = await User.find({ role: 'teacher' }).lean();

      res.render('teachers/courses/edit', {
        layout: 'teacher',
        course,
        teachers,
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async updateCourse(req, res) {
    try {
      const {
        name,
        description,
        image,
        videoId,
        level,
        duration,
        price,
        tags,
        isPublished,
      } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course)
        return res.status(404).render('errors/500', { layout: 'teacher' });

      if (name && name !== course.name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await Course.exists({ slug, _id: { $ne: course._id } })) {
          slug = `${baseSlug}-${counter++}`;
        }
        course.slug = slug;
      }

      course.name = name;
      course.description = description;
      course.image = image;
      course.videoId = extractVideoId(videoId);
      course.level = level;
      course.duration = duration;
      course.price = Number(price) || 0;
      course.tags = tags?.split(',').map((tag) => tag.trim());
      course.isFree = !price || Number(price) === 0;
      course.isPublished = isPublished === 'on';

      await course.save();

      res.redirect('/teacher/courses');
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'teacher' });
    }
  },

  async softDelete(req, res) {
    try {
      await Course.findByIdAndUpdate(req.params.id, { deleted: true });
      res.redirect('/teacher/courses');
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'teacher' });
    }
  },

  async duplicate(req, res) {
    try {
      const originalCourse = await Course.findById(req.params.id).lean();
      if (!originalCourse)
        return res.status(404).render('errors/500', { layout: 'teacher' });

      const duplicatedCourse = new Course({
        ...originalCourse,
        _id: undefined,
        slug: `${originalCourse.slug}-${uuidv4().slice(0, 6)}`,
        name: `${originalCourse.name} (Bản sao)`,
        isPublished: false,
      });

      await duplicatedCourse.save();

      res.redirect('/teacher/courses');
    } catch (err) {
      console.error('Lỗi khi nhân bản khóa học:', err);
      res.status(500).render('errors/500', { layout: 'teacher' });
    }
  },
};

export default TeacherCourseController;
