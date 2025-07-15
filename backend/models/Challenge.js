const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  images: [String],
  videoUrl: String,
  submittedAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isWinner: { type: Boolean, default: false },
  points: { type: Number, default: 0 }
});

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Monthly', 'Seasonal', 'Special', 'Community'], required: true },
  theme: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  maxParticipants: Number,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  submissions: [challengeSubmissionSchema],
  prizes: [{
    rank: Number,
    description: String,
    points: Number,
    badge: String
  }],
  rules: [String],
  requirements: [String],
  image: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' }, // Optional: community-specific challenge
  tags: [String],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema); 