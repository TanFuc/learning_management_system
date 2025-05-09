import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();

router.use('/', UserController.index);

export default router;
