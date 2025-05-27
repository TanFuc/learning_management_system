import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import { sendMail } from '../utils/mailer.js';
import User from '../models/User.js';
dotenv.config();

const UserController = {
  // [POST] /auth/login
  async confirmlogin(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('users/login', {
        error: errors.array()[0].msg,
        oldInput: req.body,
      });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.render('users/login', {
        error: 'Email không tồn tại',
        oldInput: req.body,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('users/login', {
        error: 'Mật khẩu không đúng',
        oldInput: req.body,
      });
    }

    if (!user.isVerified) {
      return res.render('users/login', { error: 'Tài khoản chưa xác minh' });
    }

    if (user.isBlocked) {
      return res.render('users/login', { error: 'Tài khoản đã bị chặn' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      secure: false,
    });
    const redirectUrl = req.body.redirect;
    console.log('Redirect URL:', redirectUrl);

    if (redirectUrl && redirectUrl.startsWith('/')) {
      res.redirect(redirectUrl);
    } else {
      res.redirect('/');
    }
  },

  // [POST] /auth/register
  async confirmregister(req, res) {
    try {
      '👉 [REQUEST BODY]:', req.body;

      const { username, email, password, role } = req.body;

      if (!username || !email || !password || !role) {
        return res.render('users/register', {
          error: 'Vui lòng nhập đầy đủ thông tin.',
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.render('users/register', {
          error: 'Email này đã được đăng ký',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationToken = crypto.randomBytes(20).toString('hex');

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        verificationToken,
        isVerified: false,
      });

      await newUser.save();

      const verifyUrl = `http://localhost:3001/auth/verify-email/${verificationToken}`;

      await sendMail({
        to: email,
        subject: 'Xác nhận đăng ký',
        text: `Xin chào ${username},\n\nVui lòng nhấn vào liên kết dưới đây để xác nhận email của bạn:\n${verifyUrl}`,
      });
      console.log('Đã gửi mail');
      res.render('users/register', {
        success: 'Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư.',
      });
    } catch (error) {
      console.error('❌ Lỗi xảy ra trong quá trình đăng ký:', error);
      res.render('users/register', {
        error: 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    }
  },

  // [GET] /auth/verify
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      console.log('Token nhận được từ URL:', token);

      const user = await User.findOne({ verificationToken: token });
      console.log('Kết quả tìm kiếm user theo token:', user);

      if (!user) {
        console.log('Token không hợp lệ hoặc không tìm thấy user');
        return res.render('users/verify-email', {
          error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn.',
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      console.log('Đã cập nhật trạng thái xác minh và xoá token');

      return res.render('users/verify-email', {
        success: 'Xác nhận email thành công. Bạn có thể đăng nhập ngay.',
      });
    } catch (err) {
      console.error('🔥 Lỗi xảy ra trong verifyEmail:', err);
      return res.status(500).render('errors/500', { layout: 'admin' });
    }
  },

  // [GET] /auth/logout
  logout(req, res) {
    res.clearCookie('token');
    res.redirect('/login');
    console.log('Logout thành công');
  },

  // [POST] /forgot-password
  async forgotPassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('users/forgot-password', {
        error: 'Email không tồn tại trong hệ thống.',
      });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:3001/auth/reset-password/${token}`;

    await sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu',
      text: `Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu:\n\n${resetUrl}`,
    });
    res.render('users/forgot-password', {
      success: 'Email đặt lại mật khẩu đã được gửi.',
    });
  },

  // [GET] /reset-password
  async getResetPassword(req, res) {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render('users/reset-password', {
        error: 'Liên kết không hợp lệ hoặc đã hết hạn.',
      });
    }

    res.render('users/reset-password', { token });
  },

  // [POST] /reset-password
  async postResetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render('users/reset-password', {
        error: 'Liên kết không hợp lệ hoặc đã hết hạn.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.render('users/reset-password', {
      success: 'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập.',
    });
  },

  async registerValidation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('users/register', {
        error: errors.array()[0].msg,
        oldInput: req.body,
      });
    }

    await UserController.confirmregister(req, res);
  },
};

export default UserController;
