// models/News.js
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
newsSchema.index({ date: -1 });
newsSchema.index({ isPublished: 1 });

const News = mongoose.model('News', newsSchema);

export default News;