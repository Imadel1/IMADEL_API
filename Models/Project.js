// Models/Project.js
import mongoose from 'mongoose';
import Newsletter from './Newsletter.js';
import sendEmail from '../Utils/sendEmail.js';
import { generateNotificationEmail } from '../Utils/emailTemplates.js';

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
  areasOfIntervention: [{
    type: String,
    enum: [
      'Rural and urban hydraulics',
      'Decentralization',
      'Hygiene/sanitation',
      'Education',
      'Formation',
      'Advocacy/lobbying',
      'Environment',
      'Health',
      'Local development'
    ]
  }],
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

// Mark document as new before saving
projectSchema.pre('save', function(next) {
  this._wasNew = this.isNew;
  next();
});

// Send email to subscribers when a new project is posted
projectSchema.post('save', async function(doc) {
  // Only send if it's a new document and published
  if (this._wasNew && doc.published) {
    try {
      const subscribers = await Newsletter.find({ subscribed: true });
      
      if (subscribers.length > 0) {
        const { subject, html } = generateNotificationEmail({ type: 'project', data: doc });
        
        const emailPromises = subscribers.map(subscriber => 
          sendEmail({
            email: subscriber.email,
            subject,
            html
          }).catch(err => console.error(`Failed to send email to ${subscriber.email}:`, err.message))
        );
        
        await Promise.all(emailPromises);
        console.log(`✅ Notified ${subscribers.length} subscribers about new project: ${doc.title}`);
      }
    } catch (error) {
      console.error('❌ Error notifying subscribers about new project:', error.message);
    }
  }
});

export default mongoose.model('Project', projectSchema);