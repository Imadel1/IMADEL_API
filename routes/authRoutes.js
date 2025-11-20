// routes/authRoutes.js
import express from 'express';
import { login, getMe } from '../Controllers/authController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

export default router;