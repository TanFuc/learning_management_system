import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { multipleToObject } from '../utils/mongoose.js';

const AdminController = {
  // [GET] /admin/dashboard
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
      res.status(500).render('errors/500', { layout: 'admin' });
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
      res.status(500).render('errors/500', { layout: 'admin' });
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

  // [GET] /users/soft-delete/:id
  async softDeleteUser(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [GET] users/restore/:id
  async restoreUser(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { isDeleted: false });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [GET] /users/hard-delete/:id
  async hardDeleteUser(req, res) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },
  // [GET] /posts/edit/
  async edit(req, res) {
    try {
      const course = await Course.findById(req.params.id).lean();
      res.render('admin/edit-course', { course });
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
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
      res.status(500).render('errors/500', { layout: 'admin' });
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

  // [POST] /users/create
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).render('errors/500', { layout: 'admin' });
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
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [GET] /users/edit/:id
  async editUserForm(req, res) {
    try {
      const user = await User.findById(req.params.id).lean();
      if (!user)
        return res.status(404).render('errors/500', { layout: 'admin' });

      res.render('admin/users/edit', {
        layout: 'admin',
        user,
      });
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [POST] /users/update/:id
  async updateUser(req, res) {
    try {
      const { username, email, role, isVerified } = req.body;

      await User.findByIdAndUpdate(req.params.id, {
        username,
        email,
        role,
        isVerified,
      });

      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [GET] /users/block/:id
  async blockUser(req, res) {
    try {
      await User.updateOne({ _id: req.params.id }, { isBlocked: true });
      res.redirect('/admin/users');
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [POST] /admin/users/unblock/:id
  async unblockUser(req, res) {
    try {
      await User.updateOne({ _id: req.params.id }, { isBlocked: false });
      res.redirect('/admin/users');
    } catch (err) {
      res.status(500).render('errors/500', { layout: 'admin' });
    }
  },
};

export default AdminController;
