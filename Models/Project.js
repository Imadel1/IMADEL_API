// Models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String
  },
  category: {
    type: String,
    enum: ['current', 'completed', 'news'],
    default: 'current'
  },
  images: [{
    url: String,
    caption: String
  }],
  location: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'upcoming', 'archived'],
    default: 'active'
  },
  impactStats: {
    beneficiaries: Number,
    communities: Number,
    budget: Number
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);