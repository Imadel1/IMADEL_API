// routes/newsRoutes.js
import express from 'express';
import { 
  getAllNews, 
  getPublishedNews, 
  getNewsById, 
  createNews, 
  updateNews, 
  deleteNews 
} from '../Controllers/newsController.js';
import { upload } from '../Middlewares/uploadMiddleware.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/published', getPublishedNews);
router.get('/:id', getNewsById);

// Admin routes (protected)
router.get('/', protect, getAllNews);
router.post('/', protect, upload.single('image'), createNews);
router.put('/:id', protect, upload.single('image'), updateNews);
router.delete('/:id', protect, deleteNews);

export default router;