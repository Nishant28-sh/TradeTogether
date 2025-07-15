const Trade = require('../models/Trade');
const Product = require('../models/Product');
const User = require('../models/User');

// Propose a new trade
exports.proposeTrade = async (req, res) => {
  try {
    const { receiver, offeredProducts, requestedProducts, cashComponent, address } = req.body;
    const proposer = req.user.id;

    // Validate required fields
    if (!receiver || !requestedProducts || requestedProducts.length === 0) {
      return res.status(400).json({ message: 'Receiver and requested products are required' });
    }

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Validate products exist and belong to correct users
    if (offeredProducts && offeredProducts.length > 0) {
      for (const productId of offeredProducts) {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: `Offered product ${productId} not found` });
        }
        if (product.owner.toString() !== proposer) {
          return res.status(403).json({ message: 'You can only offer your own products' });
        }
        if (product.status !== 'available') {
          return res.status(400).json({ message: `Product ${product.title} is not available for trade` });
        }
      }
    }

    for (const productId of requestedProducts) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Requested product ${productId} not found` });
      }
      if (product.owner.toString() !== receiver) {
        return res.status(403).json({ message: 'Requested products must belong to the receiver' });
      }
      if (product.status !== 'available') {
        return res.status(400).json({ message: `Product ${product.title} is not available for trade` });
      }
    }

    // Create the trade
    const trade = new Trade({
      proposer,
      receiver,
      offeredProducts: offeredProducts || [],
      requestedProducts,
      cashComponent: cashComponent || 0,
      address: address || '',
      status: 'pending'
    });

    await trade.save();

    // Populate the trade with user and product details
    const populatedTrade = await Trade.findById(trade._id)
      .populate('proposer', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('offeredProducts', 'title images value')
      .populate('requestedProducts', 'title images value');

    res.status(201).json({
      message: 'Trade proposed successfully',
      trade: populatedTrade
    });
  } catch (err) {
    console.error('Trade proposal error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Accept a trade
exports.acceptTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trade = await Trade.findById(id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only the receiver can accept the trade
    if (trade.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Only the receiver can accept this trade' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ message: 'Trade is not in pending status' });
    }

    // Update trade status
    trade.status = 'accepted';
    await trade.save();

    // Update product statuses
    const allProductIds = [...trade.offeredProducts, ...trade.requestedProducts];
    await Product.updateMany(
      { _id: { $in: allProductIds } },
      { status: 'traded' }
    );

    // Update user trade counts
    await User.findByIdAndUpdate(trade.proposer, { $inc: { totalTrades: 1, successfulTrades: 1 } });
    await User.findByIdAndUpdate(trade.receiver, { $inc: { totalTrades: 1, successfulTrades: 1 } });

    const populatedTrade = await Trade.findById(trade._id)
      .populate('proposer', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('offeredProducts', 'title images value')
      .populate('requestedProducts', 'title images value');

    res.json({
      message: 'Trade accepted successfully',
      trade: populatedTrade
    });
  } catch (err) {
    console.error('Trade acceptance error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Decline a trade
exports.declineTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trade = await Trade.findById(id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only the receiver can decline the trade
    if (trade.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Only the receiver can decline this trade' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ message: 'Trade is not in pending status' });
    }

    trade.status = 'declined';
    await trade.save();

    res.json({
      message: 'Trade declined successfully',
      trade
    });
  } catch (err) {
    console.error('Trade decline error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Counter a trade offer
exports.counterTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { offeredProducts, requestedProducts, cashComponent, address } = req.body;
    const userId = req.user.id;

    const originalTrade = await Trade.findById(id);
    if (!originalTrade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only the receiver can counter the trade
    if (originalTrade.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Only the receiver can counter this trade' });
    }

    if (originalTrade.status !== 'pending') {
      return res.status(400).json({ message: 'Trade is not in pending status' });
    }

    // Validate counter offer products
    if (offeredProducts && offeredProducts.length > 0) {
      for (const productId of offeredProducts) {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: `Offered product ${productId} not found` });
        }
        if (product.owner.toString() !== userId) {
          return res.status(403).json({ message: 'You can only offer your own products' });
        }
        if (product.status !== 'available') {
          return res.status(400).json({ message: `Product ${product.title} is not available for trade` });
        }
      }
    }

    // Create counter trade
    const counterTrade = new Trade({
      proposer: userId, // Now the original receiver is proposing
      receiver: originalTrade.proposer, // Original proposer becomes receiver
      offeredProducts: offeredProducts || [],
      requestedProducts: originalTrade.offeredProducts, // Request the original offered products
      cashComponent: cashComponent || 0,
      address: address || '',
      status: 'pending'
    });

    await counterTrade.save();

    // Mark original trade as countered
    originalTrade.status = 'countered';
    await originalTrade.save();

    const populatedCounterTrade = await Trade.findById(counterTrade._id)
      .populate('proposer', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('offeredProducts', 'title images value')
      .populate('requestedProducts', 'title images value');

    res.status(201).json({
      message: 'Counter trade proposed successfully',
      trade: populatedCounterTrade
    });
  } catch (err) {
    console.error('Counter trade error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's trades
exports.getTrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    let query = {
      $or: [
        { proposer: userId },
        { receiver: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const trades = await Trade.find(query)
      .populate('proposer', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('offeredProducts', 'title images value')
      .populate('requestedProducts', 'title images value')
      .sort({ createdAt: -1 });

    // Filter by type if specified
    let filteredTrades = trades;
    if (type === 'proposed') {
      filteredTrades = trades.filter(trade => trade.proposer._id.toString() === userId);
    } else if (type === 'received') {
      filteredTrades = trades.filter(trade => trade.receiver._id.toString() === userId);
    }

    res.json({
      trades: filteredTrades,
      stats: {
        total: trades.length,
        pending: trades.filter(t => t.status === 'pending').length,
        accepted: trades.filter(t => t.status === 'accepted').length,
        declined: trades.filter(t => t.status === 'declined').length,
        countered: trades.filter(t => t.status === 'countered').length
      }
    });
  } catch (err) {
    console.error('Get trades error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get trade by ID
exports.getTradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trade = await Trade.findById(id)
      .populate('proposer', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('offeredProducts', 'title images value')
      .populate('requestedProducts', 'title images value');

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Check if user is part of this trade
    if (trade.proposer._id.toString() !== userId && trade.receiver._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(trade);
  } catch (err) {
    console.error('Get trade by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};
