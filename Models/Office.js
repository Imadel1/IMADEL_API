// Models/Office.js
import mongoose from 'mongoose';

const officeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['headquarters', 'regional', 'field'],
    default: 'field'
  },
  address: {
    street: String,
    city: String,
    region: String,
    country: String,
    postalCode: String
  },
  contact: {
    phone: String,
    email: String,
    fax: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Office', officeSchema);