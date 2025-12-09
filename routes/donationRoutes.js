// routes/donationRoutes.js
import express from 'express';
import {
  initializeDonation,
  verifyDonation,
  getDonations,
  getDonation
} from '../Controllers/donationController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/initialize', initializeDonation);
router.get('/verify/:reference', verifyDonation);

// Protected routes (Admin only)
router.get('/', protect, getDonations);
router.get('/:id', protect, getDonation);

export default router;