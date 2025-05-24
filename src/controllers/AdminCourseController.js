import mongoose from 'mongoose';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { multipleToObject } from '../utils/mongoose.js';

function extractVideoId(urlOrId) {
  if (!urlOrId) return '';
  if (!urlOrId.includes('youtube.com') && !urlOrId.includes('youtu.be'))
    return urlOrId.trim();
  const match = urlOrId.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n]+)/,
  );
  return match ? match[1] : '';
}

const AdminCourseController = {
  async index(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const offset = (page - 1) * limit;

      const query = {
        deleted: false,
        name: { $regex: keyword, $options: 'i' },
      };

      const [courses, total] = await Promise.all([
        Course.find(query).populate('teacher').skip(skip).limit(limit).lean(),
        Course.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/courses/index', {
        layout: 'admin',
        courses,
        currentPage: page,
        totalPages,
        keyword,
        offset,
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async createForm(req, res) {
    try {
      const teachers = await User.find({ role: 'teacher' });
      res.render('admin/courses/create', {
        layout: 'admin',
        course: {},
        teachers: multipleToObject(teachers),
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
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
        teacher,
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
        teacher: teacher,
        isFree: !price || Number(price) === 0,
        isPublished: isPublished === 'on',
      });

      await course.save();
      res.redirect('/admin/courses');
    } catch (err) {
      console.error('Lỗi tạo khóa học:', err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async editForm(req, res) {
    try {
      const course = await Course.findById(req.params.id).lean();
      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const teachers = await User.find({ role: 'teacher' }).lean();

      res.render('admin/courses/edit', {
        layout: 'admin',
        course,
        teachers,
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async update(req, res) {
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
        teacher,
        isPublished,
      } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

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
      course.teacher = teacher;
      course.isFree = !price || Number(price) === 0;
      course.isPublished = isPublished === 'on';

      await course.save();

      res.redirect('/admin/courses');
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async softDelete(req, res) {
    try {
      await Course.findByIdAndUpdate(req.params.id, { deleted: true });
      res.redirect('/admin/courses');
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async restore(req, res) {
    try {
      await Course.findByIdAndUpdate(req.params.id, { deleted: false });
      res.redirect('/admin/courses/trash');
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async hardDelete(req, res) {
    try {
      await Course.findByIdAndDelete(req.params.id);
      res.redirect('/admin/courses/trash');
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async duplicate(req, res) {
    try {
      const originalCourse = await Course.findById(req.params.id).lean();
      if (!originalCourse)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const duplicatedCourse = new Course({
        ...originalCourse,
        _id: undefined,
        slug: `${originalCourse.slug}-${uuidv4().slice(0, 6)}`,
        name: `${originalCourse.name} (Bản sao)`,
        isPublished: false,
      });

      await duplicatedCourse.save();

      res.redirect('/admin/courses');
    } catch (err) {
      console.error('Lỗi khi nhân bản khóa học:', err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async trash(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 10;

      const filter = {
        deleted: true,
        name: { $regex: keyword, $options: 'i' },
      };

      const total = await Course.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const courses = await Course.find(filter)
        .populate('teacher')
        .skip(offset)
        .limit(limit)
        .lean();

      res.render('admin/courses/trash', {
        layout: 'admin',
        courses,
        keyword,
        currentPage: page,
        totalPages,
        offset,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },
};

export default AdminCourseController;
