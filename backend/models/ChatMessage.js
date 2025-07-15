const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // Room name (for private: trade_productId_userId1_userId2 or global)
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema); 