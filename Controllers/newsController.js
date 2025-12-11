// controllers/newsController.js
import News from '../Models/News.js';
import cloudinary from '../config/cloudinary.js';

// Get all news (for admin)
export const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await News.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message
    });
  }
};

// Get published news (for public)
export const getPublishedNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await News.find({ isPublished: true })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message
    });
  }
};

// Get single news item
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message
    });
  }
};

// Create news
export const createNews = async (req, res) => {
  try {
    const { title, description, author, date, isPublished } = req.body;

    const newsData = {
      title,
      description,
      author,
      date,
      isPublished: isPublished !== undefined ? isPublished : true
    };

    // Handle image upload from Cloudinary
    if (req.file) {
      newsData.image = req.file.path; // Cloudinary URL
    }

    const news = await News.create(newsData);

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    // Delete uploaded image from Cloudinary if news creation fails
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    res.status(400).json({
      success: false,
      message: 'Error creating news',
      error: error.message
    });
  }
};

// Update news
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      // Delete uploaded image if news not found
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const { title, description, author, date, isPublished } = req.body;

    // Update fields
    if (title) news.title = title;
    if (description) news.description = description;
    if (author) news.author = author;
    if (date) news.date = date;
    if (isPublished !== undefined) news.isPublished = isPublished;

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (news.image) {
        const publicId = news.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`ngo-news/${publicId}`);
      }
      news.image = req.file.path; // Cloudinary URL
    }

    await news.save();

    res.status(200).json({
      success: true,
      message: 'News updated successfully',
      data: news
    });
  } catch (error) {
    // Delete uploaded image if update fails
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    res.status(400).json({
      success: false,
      message: 'Error updating news',
      error: error.message
    });
  }
};

// Delete news
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Delete image from Cloudinary if exists
    if (news.image) {
      const publicId = news.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`ngo-news/${publicId}`);
    }

    await news.deleteOne();

    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting news',
      error: error.message
    });
  }
};