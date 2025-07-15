const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// Get latest trades
router.get('/latest-trades', feedController.getLatestTrades);

// Get featured users
router.get('/featured-users', feedController.getFeaturedUsers);

// Get trending items
router.get('/trending-items', feedController.getTrendingItems);

// Get community stats
router.get('/stats', feedController.getCommunityStats);

// Get community feed (combined data)
router.get('/community', feedController.getCommunityFeed);

// Get active announcements
router.get('/announcements', feedController.getActiveAnnouncements);

router.get('/community-showcase', feedController.getCommunityShowcase);

module.exports = router; 