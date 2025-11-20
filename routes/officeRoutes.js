// routes/officeRoutes.js
import express from 'express';
import {
  getOffices,
  getOffice,
  createOffice,
  updateOffice,
  deleteOffice
} from '../Controllers/officeController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getOffices)
  .post(protect, createOffice);

router.route('/:id')
  .get(getOffice)
  .put(protect, updateOffice)
  .delete(protect, deleteOffice);

export default router;