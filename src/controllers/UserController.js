import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { sendMail } from '../utils/mailer.js';
import User from '../models/User.js';
dotenv.config();

const UserController = {
  // [POST] /auth/login
  async confirmlogin(req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compare(password, user.password)) {
      return res.render('login', { error: 'Thông tin không chính xác' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1800000,
      secure: false,
    });

    res.redirect('/dashboard');
  },

  // [POST] /auth/register
  async confirmregister(req, res) {
    try {
      '👉 [REQUEST BODY]:', req.body;

      const { username, email, password, role } = req.body;

      if (!username || !email || !password || !role) {
        return res.render('register', {
          error: 'Vui lòng nhập đầy đủ thông tin.',
        });
      }

      console.log('🔍 Đang kiểm tra email:', email);
      const existingUser = await User.findOne({ email });
      console.log('🔍 Kết quả kiểm tra:', existingUser);

      if (existingUser) {
        return res.render('register', { error: 'Email này đã được đăng ký' });
      }

      console.log('🔐 Đang hash mật khẩu...');
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('🪄 Đang tạo mã xác nhận...');
      const verificationToken = crypto.randomBytes(20).toString('hex');

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        verificationToken,
        isVerified: false,
      });

      console.log('💾 Đang lưu người dùng mới...');
      await newUser.save();

      const verifyUrl = `http://localhost:3001/auth/verify-email/${verificationToken}`;
      console.log('🔗 Link xác nhận:', verifyUrl);

      console.log('Đang gửi mail');
      await sendMail({
        to: email,
        subject: 'Xác nhận đăng ký',
        text: `Xin chào ${username},\n\nVui lòng nhấn vào liên kết dưới đây để xác nhận email của bạn:\n${verifyUrl}`,
      });
      console.log('Đã gửi mail');
      res.render('register', {
        success: 'Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư.',
      });
    } catch (error) {
      console.error('❌ Lỗi xảy ra trong quá trình đăng ký:', error);
      res.render('register', { error: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    }
  },

  // [GET] /auth/verify
  async verifyEmail(req, res) {
    try {
      console.log('✅ Bắt đầu xử lý verifyEmail');

      const { token } = req.params;
      console.log('🔍 Token nhận được từ URL:', token);

      const user = await User.findOne({ verificationToken: token });
      console.log('📦 Kết quả tìm kiếm user theo token:', user);

      if (!user) {
        console.log('❌ Token không hợp lệ hoặc không tìm thấy user');
        return res.render('verify-email', {
          error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn.',
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      console.log('✅ Đã cập nhật trạng thái xác minh và xoá token');

      return res.render('verify-email', {
        success: 'Xác nhận email thành công. Bạn có thể đăng nhập ngay.',
      });
    } catch (err) {
      console.error('🔥 Lỗi xảy ra trong verifyEmail:', err);
      return res.status(500).send('Đã xảy ra lỗi hệ thống.');
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
      return res.render('forgot-password', {
        error: 'Email không tồn tại trong hệ thống.',
      });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 tiếng
    await user.save();

    const resetUrl = `http://localhost:3001/auth/reset-password/${token}`;

    await sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu',
      text: `Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu:\n\n${resetUrl}`,
    });
    res.render('forgot-password', {
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
      return res.render('reset-password', {
        error: 'Liên kết không hợp lệ hoặc đã hết hạn.',
      });
    }

    res.render('reset-password', { token });
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
      return res.render('reset-password', {
        error: 'Liên kết không hợp lệ hoặc đã hết hạn.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.render('reset-password', {
      success: 'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập.',
    });
  },
};

export default UserController;
