// Models/Donation.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  // Donor Information
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  donorPhone: {
    type: String
  },
  
  // Donation Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'XOF', // West African CFA Franc (Mali)
    enum: ['XOF', 'GHS', 'NGN', 'USD', 'EUR']
  },
  
  // Payment Information
  paymentReference: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'abandoned'],
    default: 'pending'
  },
  paymentMethod: {
    type: String // card, bank_transfer, mobile_money
  },
  
  // Paystack Details
  paystackReference: {
    type: String
  },
  authorizationCode: {
    type: String
  },
  
  // Optional
  message: {
    type: String // Donor's message
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    enum: ['general', 'education', 'healthcare', 'water', 'emergency', 'other'],
    default: 'general'
  },
  
  // Metadata
  metadata: {
    type: Object
  },
  
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Donation', donationSchema);