import express from 'express';
import HomeController from '../controllers/HomeController.js';

const router = express.Router();

router.use('/', HomeController.index);

export default router;
