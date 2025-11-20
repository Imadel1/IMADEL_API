// routes/partnerRoutes.js
import express from 'express';
import {
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner
} from '../Controllers/partnerController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPartners)
  .post(protect, createPartner);

router.route('/:id')
  .get(getPartner)
  .put(protect, updatePartner)
  .delete(protect, deletePartner);

export default router;