// Models/Job.js
import mongoose from 'mongoose';
import Newsletter from './Newsletter.js';
import sendEmail from '../Utils/sendEmail.js';
import { generateNotificationEmail } from '../Utils/emailTemplates.js';

const jobSchema = new mongoose.Schema({
  // Discriminator field to separate jobs from proposals
  listingType: {
    type: String,
    enum: ['job', 'proposal'],
    default: 'job',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  location: {
    type: String,
    required: true
  },
  // Employment type - mainly for jobs, optional for proposals
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'volunteer', 'internship'],
    default: 'full-time'
  },
  category: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open'
  },
  // Salary - mainly for jobs
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'CFA'
    }
  },
  // Budget - mainly for proposals
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'CFA'
    }
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
jobSchema.index({ listingType: 1, published: 1 });
jobSchema.index({ deadline: 1 });

// Mark document as new before saving
jobSchema.pre('save', function(next) {
  this._wasNew = this.isNew;
  next();
});

// Send email to subscribers when a new job is posted
jobSchema.post('save', async function(doc) {
  // Only send if it's a new document and published
  if (this._wasNew && doc.published) {
    try {
      const subscribers = await Newsletter.find({ subscribed: true });
      
      if (subscribers.length > 0) {
        const { subject, html } = generateNotificationEmail({ type: 'job', data: doc });
        
        const emailPromises = subscribers.map(subscriber => 
          sendEmail({
            email: subscriber.email,
            subject,
            html
          }).catch(err => console.error(`Failed to send email to ${subscriber.email}:`, err.message))
        );
        
        await Promise.all(emailPromises);
        const itemType = doc.listingType === 'proposal' ? 'proposal' : 'job';
        console.log(`✅ Notified ${subscribers.length} subscribers about new ${itemType}: ${doc.title}`);
      }
    } catch (error) {
      const itemType = doc.listingType === 'proposal' ? 'proposal' : 'job';
      console.error(`❌ Error notifying subscribers about new ${itemType}:`, error.message);
    }
  }
});

export default mongoose.model('Job', jobSchema);