// routes/applicationRoutes.js
import express from 'express';
import {
  submitApplication,
  getApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication
} from '../Controllers/applicationController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Public route - submit application
router.post('/', submitApplication);

// Protected routes - admin only
router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.put('/:id', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

export default router;