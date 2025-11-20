// routes/newsletterRoutes.js
import express from 'express';
import {
  getSubscribers,
  subscribe,
  unsubscribe,
  deleteSubscriber
} from '../Controllers/newsletterController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSubscribers);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.delete('/:id', protect, deleteSubscriber);

export default router;