// routes/uploadRoutes.js
import express from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage
} from '../Controllers/uploadController.js';
import { upload } from '../Middlewares/uploadMiddleware.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/image', protect, upload.single('image'), uploadImage);
router.post('/images', protect, upload.array('images', 10), uploadMultipleImages);
router.delete('/:filename', protect, deleteImage);

export default router;