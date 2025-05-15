const { check, validationResult } = require('express-validator');

export const validateLogin = [
  check('email')
    .notEmpty()
    .withMessage('Email không được để trống')
    .isEmail()
    .withMessage('Email không hợp lệ'),

  check('password').notEmpty().withMessage('Mật khẩu không được để trống'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', {
        error: errors.array()[0].msg,
        oldInput: req.body,
      });
    }
    next();
  },
];
