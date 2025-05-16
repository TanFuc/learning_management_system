import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { multipleToObject } from '../utils/mongoose.js';

const AdminController = {
  // [GET] /admin
  async index(req, res) {
    try {
      const usersCount = await User.countDocuments();
      const postsCount = await Course.countDocuments();
      res.render('admin/index', {
        layout: 'admin',
        usersCount,
        postsCount,
      });
    } catch (error) {
      console.error('Lỗi khi load trang admin dashboard:', error);
      res.status(500).send('Lỗi server');
    }
  },

  // [GET] /users
  async userAdmin(req, res) {
    try {
      const keyword = req.query.keyword?.trim() || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const startIndex = (page - 1) * limit;

      let query = {};
      if (keyword) {
        query = {
          $or: [
            { username: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
          ],
        };
      }

      const totalUsers = await User.countDocuments(query);
      const users = await User.find(query).skip(startIndex).limit(limit).lean();

      res.render('admin/users/index', {
        layout: 'admin',
        users,
        keyword,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        startIndex,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi máy chủ');
    }
  },

  // [GET] courses
  async postAdmin(req, res) {
    const courses = await Course.find().populate('teacher');
    res.render('admin/courses/index', {
      layout: 'admin',
      courses: multipleToObject(courses),
    });
  },

  // [GET] /comments
  commentAdmin(req, res) {
    res.render('admin/comments/index', {
      layout: 'admin',
      comments,
      isCommentsPage: true,
    });
  },

  async softDeleteUser(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).send('Lỗi khi xóa tạm người dùng.');
    }
  },

  async restoreUser(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { isDeleted: false });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).send('Lỗi khi khôi phục người dùng.');
    }
  },

  async hardDeleteUser(req, res) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).send('Lỗi khi xóa người dùng.');
    }
  },
  // [GET] /posts/edit/
  async edit(req, res) {
    try {
      const course = await Course.findById(req.params.id).lean();
      res.render('admin/edit-course', { course });
    } catch (error) {
      res.status(500).send('Không tìm thấy bài đăng.');
    }
  },

  // [POST] /posts/edit/
  async update(req, res) {
    try {
      const { name, price, description, isPublished } = req.body;
      await Course.findByIdAndUpdate(req.params.id, {
        name,
        price,
        description,
        isPublished: isPublished === 'true',
      });
      res.redirect('/admin/posts');
    } catch (error) {
      res.status(500).send('Lỗi khi cập nhật bài đăng.');
    }
  },

  async softDeletePost(req, res) {
    await Course.findByIdAndUpdate(req.params.id, { deleted: true });
    res.redirect('/admin/posts');
  },

  async restorePost(req, res) {
    await Course.findByIdAndUpdate(req.params.id, { deleted: false });
    res.redirect('/admin/posts');
  },

  async hardDeletePost(req, res) {
    await Course.findByIdAndDelete(req.params.id);
    res.redirect('/admin/posts');
  },

  showCreateForm(req, res) {
    res.render('admin/users/create');
  },

  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('Email đã tồn tại!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        username,
        email,
        password: hashedPassword,
        role,
        isVerified: true,
      });

      res.redirect('/admin/users');
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      res.status(500).send('Đã xảy ra lỗi khi tạo người dùng.');
    }
  },

  async editUserForm(req, res) {
    try {
      const user = await User.findById(req.params.id).lean();
      if (!user) return res.status(404).send('Không tìm thấy người dùng.');

      res.render('admin/users/edit', {
        layout: 'admin',
        user,
      });
    } catch (error) {
      res.status(500).send('Lỗi khi hiển thị form chỉnh sửa.');
    }
  },

  async updateUser(req, res) {
    try {
      const { username, email, role } = req.body;

      await User.findByIdAndUpdate(req.params.id, {
        username,
        email,
        role,
      });

      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).send('Lỗi khi cập nhật người dùng.');
    }
  },

  async blockUser(req, res) {
    try {
      await User.updateOne({ _id: req.params.id }, { isBlocked: true });
      res.redirect('/admin/users');
    } catch (err) {
      res.status(500).send('Có lỗi khi chặn người dùng');
    }
  },

  // POST /admin/users/unblock/:id
  async unblockUser(req, res) {
    try {
      await User.updateOne({ _id: req.params.id }, { isBlocked: false });
      res.redirect('/admin/users');
    } catch (err) {
      res.status(500).send('Có lỗi khi mở khóa người dùng');
    }
  },
};

export default AdminController;
