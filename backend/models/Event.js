const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Workshop', 'Exhibition', 'Competition', 'Meetup', 'Webinar', 'Market', 'Other'], 
    required: true 
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isOnline: { type: Boolean, default: false },
    onlineUrl: String
  },
  image: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: Number,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  category: { 
    type: String, 
    enum: ['Art', 'Craft', 'Design', 'Technology', 'Business', 'Education', 'Social', 'Other'],
    default: 'Other'
  },
  price: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    isFree: { type: Boolean, default: true }
  },
  registrationDeadline: Date,
  requirements: [String],
  highlights: [String],
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Cancelled', 'Completed'], 
    default: 'Draft' 
  }
}, { timestamps: true });

// Index for better query performance
eventSchema.index({ date: 1, isActive: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema); 