// models/News.js
import mongoose from 'mongoose';
import Newsletter from './Newsletter.js';
import sendEmail from '../Utils/sendEmail.js';
import { generateNotificationEmail } from '../Utils/emailTemplates.js';

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

// Mark document as new before saving
newsSchema.pre('save', function(next) {
  this._wasNew = this.isNew;
  next();
});

// Send email to subscribers when a new news is posted
newsSchema.post('save', async function(doc) {
  // Only send if it's a new document and published
  if (this._wasNew && doc.isPublished) {
    try {
      const subscribers = await Newsletter.find({ subscribed: true });
      
      if (subscribers.length > 0) {
        const { subject, html } = generateNotificationEmail({ type: 'news', data: doc });
        
        const emailPromises = subscribers.map(subscriber => 
          sendEmail({
            email: subscriber.email,
            subject,
            html
          }).catch(err => console.error(`Failed to send email to ${subscriber.email}:`, err.message))
        );
        
        await Promise.all(emailPromises);
        console.log(`✅ Notified ${subscribers.length} subscribers about new news: ${doc.title}`);
      }
    } catch (error) {
      console.error('❌ Error notifying subscribers about new news:', error.message);
    }
  }
});

const News = mongoose.model('News', newsSchema);

export default News;