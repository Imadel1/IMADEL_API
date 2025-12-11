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

// ➕ ADD THIS ROUTE
router.get('/public', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ subscribed: true }).lean();
    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.get('/', protect, getSubscribers);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.delete('/:id', protect, deleteSubscriber);

export default router;