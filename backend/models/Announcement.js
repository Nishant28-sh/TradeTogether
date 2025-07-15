const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Platform Update', 'Feature Announcement', 'Success Story', 'Community Highlight', 'Safety Alert', 'Event Reminder'], 
    required: true 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  targetAudience: { 
    type: String, 
    enum: ['All Users', 'Artisans Only', 'New Users', 'Verified Users', 'Community Admins'], 
    default: 'All Users' 
  },
  image: String,
  link: String,
  tags: [String],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: Date,
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' }, // Optional: community-specific announcement
  stats: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema); 