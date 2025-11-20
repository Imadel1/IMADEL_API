// Models/Partner.js
import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  category: {
    type: String,
    enum: ['funding', 'implementation', 'technical', 'government', 'community', 'other'],
    default: 'other'
  },
  partnershipStartDate: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Partner', partnerSchema);