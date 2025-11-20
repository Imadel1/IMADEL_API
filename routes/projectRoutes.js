// routes/jobRoutes.js
import express from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
} from '../Controllers/jobController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, createJob);

router.route('/:id')
  .get(getJob)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;