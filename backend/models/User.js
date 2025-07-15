const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  comment: String,
  date: { type: Date, default: Date.now }
});

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: { type: String, required: true },
  category: String,
  price: Number,
  isForSale: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ type: String }],
  location: String,
  profilePhoto: String,
  bio: String,
  isArtisan: { type: Boolean, default: false },
  artisanLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Expert', 'Master'], default: 'Beginner' },
  yearsOfExperience: Number,
  specialties: [{ type: String }],
  portfolio: [portfolioItemSchema],
  ratings: { type: Number, default: 0 },
  reviews: [reviewSchema],
  socialLinks: {
    instagram: String,
    facebook: String,
    website: String
  },
  // New features for enhanced community functionality
  isVerified: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }], // References to community posts
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  totalTrades: { type: Number, default: 0 },
  successfulTrades: { type: Number, default: 0 },
  communityPoints: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 