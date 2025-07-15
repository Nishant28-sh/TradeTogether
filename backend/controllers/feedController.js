const Trade = require('../models/Trade');
const User = require('../models/User');
const Product = require('../models/Product');
const Announcement = require('../models/Announcement');

// Get latest trades
exports.getLatestTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ status: 'accepted' })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('proposer', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('offeredProducts', 'title images value')
      .populate('requestedProducts', 'title images value');
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get featured users (top rated)
exports.getFeaturedUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      isArtisan: true,
      ratings: { $gt: 0 }
    })
    .sort({ ratings: -1, successfulTrades: -1 })
    .limit(6)
    .select('name profilePhoto artisanLevel skills location isVerified ratings totalTrades successfulTrades');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get trending items (most traded or most recent)
exports.getTrendingItems = async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('owner', 'name profilePhoto artisanLevel');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get community stats
exports.getCommunityStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArtisans = await User.countDocuments({ isArtisan: true });
    const totalProducts = await Product.countDocuments();
    const totalTrades = await Trade.countDocuments({ status: 'accepted' });
    const totalSuccessfulTrades = await Trade.countDocuments({ status: 'accepted' });

    res.json({
      totalUsers,
      totalArtisans,
      totalProducts,
      totalTrades,
      totalSuccessfulTrades
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get community feed (combined data)
exports.getCommunityFeed = async (req, res) => {
  try {
    const [latestTrades, featuredUsers, trendingItems, stats] = await Promise.all([
      Trade.find({ status: 'accepted' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('proposer', 'name profilePhoto')
        .populate('receiver', 'name profilePhoto')
        .populate('offeredProducts', 'title images value')
        .populate('requestedProducts', 'title images value'),
      
      User.find({ 
        isArtisan: true,
        ratings: { $gt: 0 }
      })
      .sort({ ratings: -1, successfulTrades: -1 })
      .limit(4)
      .select('name profilePhoto artisanLevel skills location isVerified ratings totalTrades successfulTrades'),
      
      Product.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('owner', 'name profilePhoto artisanLevel'),
      
      Promise.all([
        User.countDocuments(),
        User.countDocuments({ isArtisan: true }),
        Product.countDocuments(),
        Trade.countDocuments({ status: 'accepted' })
      ])
    ]);

    const [totalUsers, totalArtisans, totalProducts, totalTrades] = stats;

    res.json({
      latestTrades,
      featuredUsers,
      trendingItems,
      stats: {
        totalUsers,
        totalArtisans,
        totalProducts,
        totalTrades
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get active announcements
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ 
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(5)
    .populate('createdBy', 'name profileImage');
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get community showcase data (all in one endpoint)
exports.getCommunityShowcase = async (req, res) => {
  try {
    const [latestTrades, featuredUsers, trendingItems, announcements] = await Promise.all([
      Trade.find({ status: 'accepted' })
        .sort({ updatedAt: -1 })
        .limit(6)
        .populate([
          { path: 'proposer', select: 'name profilePhoto profileImage' },
          { path: 'receiver', select: 'name profilePhoto profileImage' },
          { path: 'offeredProducts' },
          { path: 'requestedProducts' }
        ]),
      User.find().sort({ ratings: -1 }).limit(4).select('name skills profileImage ratings'),
      Product.find().sort({ updatedAt: -1 }).limit(8),
      Announcement.find({ 
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3)
      .populate('createdBy', 'name profileImage')
    ]);

    // After fetching latestTrades, set default profilePhoto and profileImage if both are missing
    latestTrades.forEach(trade => {
      if (trade.proposer) {
        if (!trade.proposer.profilePhoto && !trade.proposer.profileImage) {
          trade.proposer.profilePhoto = 'https://randomuser.me/api/portraits/lego/1.jpg';
          trade.proposer.profileImage = 'https://randomuser.me/api/portraits/lego/1.jpg';
        } else if (!trade.proposer.profilePhoto && trade.proposer.profileImage) {
          trade.proposer.profilePhoto = trade.proposer.profileImage;
        } else if (!trade.proposer.profileImage && trade.proposer.profilePhoto) {
          trade.proposer.profileImage = trade.proposer.profilePhoto;
        }
      }
    });

    res.json({
      latestTrades,
      featuredUsers,
      trendingItems,
      announcements
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 