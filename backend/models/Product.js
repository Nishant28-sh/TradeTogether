const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  images: [{ type: String }],
  tags: [{ type: String }],
  value: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'traded', 'removed'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema); 