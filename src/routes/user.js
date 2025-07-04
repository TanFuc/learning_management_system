import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { registerValidation } from '../middleware/validateSignup.js';
import UserController from '../controllers/UserController.js';

const router = express.Router();

router.post('/forgot-password', UserController.forgotPassword);
router.post('/register', registerValidation, UserController.registerValidation);
router.post('/login', UserController.confirmlogin);
router.post('/reset-password/:token', UserController.postResetPassword);
router.get('/forgot-password', (req, res) =>
  res.render('users/forgot-password'),
);
router.get('/reset-password/:token', UserController.getResetPassword);
router.get('/verify-email/:token', UserController.verifyEmail);
router.get('/logout', UserController.logout);

export default router;
