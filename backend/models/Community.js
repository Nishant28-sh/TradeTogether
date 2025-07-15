const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  duration: Number, // in minutes
  type: { type: String, enum: ['Workshop', 'Live Stream', 'Meetup', 'Class'], required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maxParticipants: Number,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLive: { type: Boolean, default: false },
  streamUrl: String,
  materials: [String], // required materials for workshop
  price: { type: Number, default: 0 },
  image: String
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  isInspiration: { type: Boolean, default: false } // for style inspiration posts
}, { timestamps: true });

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // New features
  events: [eventSchema],
  posts: [postSchema],
  category: { type: String, enum: ['Crafts', 'Art', 'Jewelry', 'Textiles', 'Pottery', 'General'], default: 'General' },
  isPrivate: { type: Boolean, default: false },
  rules: [String],
  featuredArtisans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema); 