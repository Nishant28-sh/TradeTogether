const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedContent: {
    type: { type: String, enum: ['User', 'Post', 'Comment', 'Product', 'Community', 'Event'], required: true },
    contentId: mongoose.Schema.Types.ObjectId,
    model: { type: String, enum: ['User', 'Community', 'Product', 'Challenge'] }
  },
  reason: { 
    type: String, 
    enum: [
      'Inappropriate Content', 
      'Spam', 
      'Harassment', 
      'Fake Information', 
      'Copyright Violation', 
      'Safety Concern', 
      'Other'
    ], 
    required: true 
  },
  description: { type: String, required: true },
  evidence: [String], // URLs to screenshots or other evidence
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed'], 
    default: 'Pending' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Moderator assigned
  resolution: {
    action: { type: String, enum: ['Warning', 'Content Removal', 'Temporary Ban', 'Permanent Ban', 'No Action'] },
    notes: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema); 