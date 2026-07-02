const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');


// Multer config for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/profilePhotos'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Multer config for portfolio uploads
const portfolioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/portfolio'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });
const portfolioUpload = multer({ storage: portfolioStorage });

// Authentication routes (must be before wildcard routes)
router.post('/register', upload.single('profilePhoto'), userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/google-login', userController.googleLogin);

// Artisan features (specific route before parameter routes)
router.get('/artisans', userController.getArtisans);

// Portfolio management (specific routes before parameter routes)
router.post('/portfolio', auth, portfolioUpload.single('image'), userController.addPortfolioItem);
router.delete('/portfolio/:itemId', auth, userController.removePortfolioItem);

// Get all users (for chat user list)
router.get('/all', userController.getAllUsers);

// Search users
router.get('/search', userController.searchUsers);

// Update profile (must be before /:id)
router.put('/profile', auth, userController.updateUserProfile);

// Create inspiration board
router.post('/inspiration-board', auth, userController.createInspirationBoard);

// Wishlist routes (must be before parameter routes)
router.post('/wishlist/:productId', auth, userController.addToWishlist);
router.get('/wishlist', auth, userController.getWishlist);
router.delete('/wishlist/:itemId', auth, userController.removeFromWishlist);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User route working!' });
});

// Profile routes (parameter routes last)
router.get('/:id', userController.getUserProfile);
router.post('/:id/upload-profile-photo', auth, upload.single('profilePhoto'), userController.uploadProfilePhoto);
router.get('/:userId/portfolio', userController.getPortfolio);

// Follow/Unfollow user
router.post('/:userId/follow', auth, userController.followUser);

// Get user's followers
router.get('/:userId/followers', userController.getFollowers);

// Get user's following
router.get('/:userId/following', userController.getFollowing);

// Update verification status (admin only)
router.put('/:userId/verify', auth, userController.updateVerificationStatus);

// Get user activity
router.get('/:userId/activity', userController.getUserActivity);

// Review routes
router.post('/:userId/reviews', auth, userController.addReview);
router.get('/:userId/reviews', userController.getUserReviews);

// Add inspiration board item
router.post('/inspiration-board/:boardId', auth, userController.addToInspirationBoard);

module.exports = router;