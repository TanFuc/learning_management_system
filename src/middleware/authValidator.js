// validators/authValidator.js
import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .notEmpty()
    .withMessage('Họ và tên không được để trống')
    .isLength({ min: 3 })
    .withMessage('Họ và tên phải có ít nhất 3 ký tự'),

  body('email')
    .notEmpty()
    .withMessage('Email không được để trống')
    .isEmail()
    .withMessage('Email không hợp lệ'),

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Vui lòng nhập lại mật khẩu')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Mật khẩu nhập lại không khớp'),

  body('role').notEmpty().withMessage('Vui lòng chọn vai trò'),
];
