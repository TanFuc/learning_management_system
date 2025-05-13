import express from 'express';
import HomeController from '../controllers/HomeController.js';

const router = express.Router();

router.use('/login', HomeController.login);
router.use('/contact', HomeController.contact);
router.use('/about', HomeController.about);
router.use('/register', HomeController.register);
router.use('/forgot-password', HomeController.forgotPassword);
router.use('/', HomeController.index);

export default router;
