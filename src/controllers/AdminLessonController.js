import Course from '../models/Course.js';
import LessonGroup from '../models/LessonGroup.js';
import Lesson from '../models/Lesson.js';

const AdminLessonController = {
  // Danh sách nhóm bài học của một khóa học
  async listLessonGroups(req, res) {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId).lean();
      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const lessonGroups = await LessonGroup.find({ course: courseId }).lean();

      res.render('admin/lessonGroups/index', {
        layout: 'admin',
        course,
        lessonGroups,
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Danh sách bài học của một nhóm bài học
  async listLessons(req, res) {
    try {
      const lessonGroupId = req.params.lessonGroupId;
      const lessonGroup = await LessonGroup.findById(lessonGroupId).lean();
      if (!lessonGroup)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const lessons = await Lesson.find({ lessonGroup: lessonGroupId })
        .sort({ order: 1 })
        .lean();

      res.render('admin/lessons/index', {
        layout: 'admin',
        lessonGroup,
        lessons,
      });
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Validate và tạo LessonGroup
  async createLessonGroup(req, res) {
    try {
      const { title } = req.body;
      const courseId = req.params.courseId;

      if (!title || title.trim() === '') {
        return res.status(400).render('errors/500', { layout: 'admin' });
      }

      const lessonGroup = new LessonGroup({
        title: title.trim(),
        course: courseId,
      });
      await lessonGroup.save();

      res.redirect(`/courses/${courseId}/lesson-groups`);
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Validate và tạo Lesson
  async createLesson(req, res) {
    try {
      const { order, title, videoId } = req.body;
      const lessonGroupId = req.params.lessonGroupId;

      if (!title || title.trim() === '') {
        return res.status(400).render('errors/500', { layout: 'admin' });
      }

      if (!order || isNaN(order) || order < 1) {
        return res.status(400).render('errors/500', { layout: 'admin' });
      }

      const lesson = new Lesson({
        order: parseInt(order, 10),
        title: title.trim(),
        videoId: videoId ? videoId.trim() : '',
        lessonGroup: lessonGroupId,
      });
      await lesson.save();

      res.redirect(`/lesson-groups/${lessonGroupId}/lessons`);
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Hiển thị form tạo nhóm bài học
  async showCreateLessonGroupForm(req, res) {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId).lean();
      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

      res.render('admin/lessonGroups/create', { layout: 'admin', course });
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Xử lý tạo nhóm bài học mới
  async createLessonGroup(req, res) {
    try {
      const courseId = req.params.courseId;
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).render('errors/500', { layout: 'admin' });
      }

      // Kiểm tra khóa học tồn tại
      const course = await Course.findById(courseId);
      if (!course)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const lessonGroup = new LessonGroup({
        title: title.trim(),
        course: courseId,
      });
      await lessonGroup.save();

      res.redirect(`/admin/courses/${courseId}/lesson-groups`);
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Hiển thị form tạo bài học
  async showCreateLessonForm(req, res) {
    try {
      const lessonGroupId = req.params.lessonGroupId;
      const lessonGroup = await LessonGroup.findById(lessonGroupId).lean();
      if (!lessonGroup)
        return res.status(404).render('errors/500', { layout: 'admin' });

      res.render('admin/lessons/create', { layout: 'admin', lessonGroup });
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // Xử lý tạo bài học mới
  async createLesson(req, res) {
    try {
      const lessonGroupId = req.params.lessonGroupId;
      const { order, title, videoId } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).render('errors/500', { layout: 'admin' });
      }

      if (!order || isNaN(order) || order < 1) {
        return res.status(400).render('errors/500', { layout: 'admin' });
      }

      // Kiểm tra nhóm bài học tồn tại
      const lessonGroup = await LessonGroup.findById(lessonGroupId);
      if (!lessonGroup)
        return res.status(404).render('errors/500', { layout: 'admin' });

      const lesson = new Lesson({
        order: parseInt(order, 10),
        title: title.trim(),
        videoId: videoId ? videoId.trim() : '',
        lessonGroup: lessonGroupId,
      });
      await lesson.save();

      res.redirect(`/admin/lesson-groups/${lessonGroupId}/lessons`);
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // GET form edit
  async editGroup(req, res) {
    try {
      const lessonGroup = await LessonGroup.findById(req.params.id)
        .populate('course')
        .lean();
      if (!lessonGroup) {
        return res.status(404).render('errors/500', { layout: 'admin' });
      }
      res.render('admin/lessonGroups/edit', { layout: 'admin', lessonGroup });
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // PUT update
  async updateGroup(req, res) {
    try {
      const { title } = req.body;
      const updatedLessonGroup = await LessonGroup.findByIdAndUpdate(
        req.params.id,
        { title },
        { new: true },
      )
        .populate('course')
        .lean();

      if (!updatedLessonGroup) {
        return res.status(404).render('errors/500', { layout: 'admin' });
      }
      res.redirect(
        `/admin/courses/${updatedLessonGroup.course._id}/lesson-groups`,
      );
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // DELETE
  async deleteGroup(req, res) {
    try {
      const lessonGroupId = req.params.id;

      // Xóa tất cả bài học thuộc nhóm này
      await Lesson.deleteMany({ lessonGroup: lessonGroupId });

      // Xóa nhóm bài học
      const deletedGroup =
        await LessonGroup.findByIdAndDelete(lessonGroupId).populate('course');

      if (!deletedGroup) {
        return res.status(404).render('errors/500', { layout: 'admin' });
      }

      // Redirect về danh sách nhóm bài học của khóa học tương ứng
      res.redirect(`/admin/courses/${deletedGroup.course._id}/lesson-groups`);
    } catch (error) {
      console.error(error);
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async editLesson(req, res) {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate('lessonGroup')
        .lean();
      if (!lesson)
        return res.status(404).render('errors/500', { layout: 'admin' });

      res.render('admin/lessons/edit', {
        layout: 'admin',
        lesson,
      });
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async updateLesson(req, res) {
    try {
      const { title, videoId, order } = req.body;

      const lesson = await Lesson.findById(req.params.id).populate(
        'lessonGroup',
      );
      if (!lesson)
        return res.status(404).render('errors/500', { layout: 'admin' });

      await Lesson.findByIdAndUpdate(req.params.id, {
        title,
        videoId,
        order,
      });

      res.redirect(`/admin/lesson-groups/${lesson.lessonGroup._id}/lessons`);
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  async deleteLesson(req, res) {
    try {
      const lesson = await Lesson.findById(req.params.id).populate(
        'lessonGroup',
      );
      if (!lesson)
        return res.status(404).render('errors/500', { layout: 'admin' });

      await Lesson.findByIdAndDelete(req.params.id);

      res.redirect(`/admin/lesson-groups/${lesson.lessonGroup._id}/lessons`);
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },
};
export default AdminLessonController;
