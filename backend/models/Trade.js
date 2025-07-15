const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const tradeSchema = new mongoose.Schema({
  proposer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  requestedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cashComponent: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'countered'], default: 'pending' },
  chatHistory: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema); 