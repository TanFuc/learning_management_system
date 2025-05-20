import Course from '../models/Course.js';
import LessonGroup from '../models/LessonGroup.js';
import Lesson from '../models/Lesson.js';

const AdminLessonController = {
  // Danh sách nhóm bài học của một khóa học
  async listLessonGroups(req, res) {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId).lean();
      if (!course) return res.status(404).send('Khóa học không tồn tại');

      const lessonGroups = await LessonGroup.find({ course: courseId }).lean();

      res.render('admin/lessonGroups/index', {
        layout: 'admin',
        course,
        lessonGroups,
      });
    } catch (err) {
      res.status(500).send('Lỗi server khi lấy nhóm bài học');
    }
  },

  // Danh sách bài học của một nhóm bài học
  async listLessons(req, res) {
    try {
      const lessonGroupId = req.params.lessonGroupId;
      const lessonGroup = await LessonGroup.findById(lessonGroupId).lean();
      if (!lessonGroup)
        return res.status(404).send('Nhóm bài học không tồn tại');

      const lessons = await Lesson.find({ lessonGroup: lessonGroupId })
        .sort({ order: 1 })
        .lean();

      res.render('admin/lessons/index', {
        layout: 'admin',
        lessonGroup,
        lessons,
      });
    } catch (err) {
      res.status(500).send('Lỗi server khi lấy bài học');
    }
  },

  // Validate và tạo LessonGroup
  async createLessonGroup(req, res) {
    try {
      const { title } = req.body;
      const courseId = req.params.courseId;

      if (!title || title.trim() === '') {
        return res.status(400).send('Tiêu đề nhóm bài học không được để trống');
      }

      const lessonGroup = new LessonGroup({
        title: title.trim(),
        course: courseId,
      });
      await lessonGroup.save();

      res.redirect(`/courses/${courseId}/lesson-groups`);
    } catch (err) {
      res.status(500).send('Lỗi server khi tạo nhóm bài học');
    }
  },

  // Validate và tạo Lesson
  async createLesson(req, res) {
    try {
      const { order, title, videoId } = req.body;
      const lessonGroupId = req.params.lessonGroupId;

      if (!title || title.trim() === '') {
        return res.status(400).send('Tiêu đề bài học không được để trống');
      }

      if (!order || isNaN(order) || order < 1) {
        return res.status(400).send('Thứ tự bài học không hợp lệ');
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
      res.status(500).send('Lỗi server khi tạo bài học');
    }
  },

  // Hiển thị form tạo nhóm bài học
  async showCreateLessonGroupForm(req, res) {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId).lean();
      if (!course) return res.status(404).send('Khóa học không tồn tại');

      res.render('admin/lessonGroups/create', { layout: 'admin', course });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server khi hiển thị form tạo nhóm bài học');
    }
  },

  // Xử lý tạo nhóm bài học mới
  async createLessonGroup(req, res) {
    try {
      const courseId = req.params.courseId;
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).send('Tiêu đề nhóm bài học không được để trống');
      }

      // Kiểm tra khóa học tồn tại
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).send('Khóa học không tồn tại');

      const lessonGroup = new LessonGroup({
        title: title.trim(),
        course: courseId,
      });
      await lessonGroup.save();

      res.redirect(`/admin/courses/${courseId}/lesson-groups`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server khi tạo nhóm bài học');
    }
  },

  // Hiển thị form tạo bài học
  async showCreateLessonForm(req, res) {
    try {
      const lessonGroupId = req.params.lessonGroupId;
      const lessonGroup = await LessonGroup.findById(lessonGroupId).lean();
      if (!lessonGroup)
        return res.status(404).send('Nhóm bài học không tồn tại');

      res.render('admin/lessons/create', { layout: 'admin', lessonGroup });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server khi hiển thị form tạo bài học');
    }
  },

  // Xử lý tạo bài học mới
  async createLesson(req, res) {
    try {
      const lessonGroupId = req.params.lessonGroupId;
      const { order, title, videoId } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).send('Tiêu đề bài học không được để trống');
      }

      if (!order || isNaN(order) || order < 1) {
        return res.status(400).send('Thứ tự bài học không hợp lệ');
      }

      // Kiểm tra nhóm bài học tồn tại
      const lessonGroup = await LessonGroup.findById(lessonGroupId);
      if (!lessonGroup)
        return res.status(404).send('Nhóm bài học không tồn tại');

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
      res.status(500).send('Lỗi server khi tạo bài học');
    }
  },
};

export default AdminLessonController;
