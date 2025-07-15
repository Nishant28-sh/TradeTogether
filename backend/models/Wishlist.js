const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  images: [String],
  isPublic: { type: Boolean, default: true },
  tags: [String],
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
});

const inspirationBoardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  isPublic: { type: Boolean, default: true },
  items: [{
    type: { type: String, enum: ['product', 'post', 'image', 'link'], required: true },
    reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.model' },
    model: { type: String, enum: ['Product', 'Community'], required: true },
    title: String,
    description: String,
    image: String,
    url: String,
    addedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wishlistItems: [wishlistItemSchema],
  inspirationBoards: [inspirationBoardSchema],
  publicWishlist: { type: Boolean, default: true },
  allowRequests: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema); 