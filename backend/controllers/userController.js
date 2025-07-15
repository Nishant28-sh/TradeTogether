const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Wishlist = require('../models/Wishlist');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const client = new OAuth2Client('590154599751-p9qpkbp2u13775vcasiassr0ka2iujsv.apps.googleusercontent.com');

async function downloadImage(url, filename) {
  const response = await axios({ url, responseType: 'stream' });
  const filePath = path.join(__dirname, '../uploads/profilePhotos', filename);
  await new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filePath))
      .on('finish', resolve)
      .on('error', reject);
  });
  return `/uploads/profilePhotos/${filename}`;
}

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    console.log('REGISTER req.body:', req.body);
    console.log('REGISTER req.file:', req.file);
    if (!req.body) {
      console.error('No form data received');
      return res.status(400).json({ message: 'No form data received' });
    }
    const { name, email, password, location, bio, isArtisan, artisanLevel, yearsOfExperience, specialties } = req.body;
    let skills = req.body.skills;
    // Parse skills if sent as JSON string
    if (typeof skills === 'string') {
      try { skills = JSON.parse(skills); } catch { skills = []; }
    }
    if (!Array.isArray(skills)) skills = [];
    
    let profilePhoto = '';
    if (req.file) {
      // Save filename for uploaded file
      profilePhoto = '/uploads/profilePhotos/' + req.file.filename;
    }
    if (!name || !email || !password) {
      console.error('Missing required fields:', { name, email, password });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      skills, 
      location, 
      profilePhoto,
      bio,
      isArtisan: isArtisan === 'true',
      artisanLevel,
      yearsOfExperience,
      specialties: specialties ? JSON.parse(specialties) : []
    });
    await user.save();
    console.log('User registered successfully:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: err.message, error: err });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    console.log('LOGIN req.body:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Login failed: user not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Login failed: password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    console.log('Login successful for:', email);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        skills: user.skills, 
        location: user.location, 
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        isArtisan: user.isArtisan,
        artisanLevel: user.artisanLevel
      } 
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: err.message, error: err });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { bio, artisanLevel, yearsOfExperience, specialties, socialLinks } = req.body;
    const updateData = {};
    
    if (bio !== undefined) updateData.bio = bio;
    if (artisanLevel !== undefined) updateData.artisanLevel = artisanLevel;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (specialties !== undefined) updateData.specialties = JSON.parse(specialties);
    if (socialLinks !== undefined) updateData.socialLinks = JSON.parse(socialLinks);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload profile photo for existing user
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const profilePhoto = '/uploads/profilePhotos/' + req.file.filename;
    // Update user profilePhoto field
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ profilePhoto: user.profilePhoto });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get artisans (filtered users)
exports.getArtisans = async (req, res) => {
  try {
    const { category, level, location } = req.query;
    let query = { isArtisan: true };
    
    if (category) {
      query.skills = { $in: [category] };
    }
    if (level) {
      query.artisanLevel = level;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const artisans = await User.find(query)
      .select('name profilePhoto artisanLevel skills specialties bio location ratings')
      .sort({ ratings: -1 });
    
    res.json(artisans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add portfolio item
exports.addPortfolioItem = async (req, res) => {
  try {
    const { title, description, category, price, isForSale } = req.body;
    let image = '';
    
    if (req.file) {
      image = req.file.filename;
    }
    
    const portfolioItem = {
      title,
      description,
      image,
      category,
      price: price ? parseFloat(price) : null,
      isForSale: isForSale === 'true'
    };
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { portfolio: portfolioItem } },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const newItem = user.portfolio[user.portfolio.length - 1];
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's portfolio
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('portfolio name');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      portfolio: user.portfolio,
      artisanName: user.name
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove portfolio item
exports.removePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { portfolio: { _id: itemId } } },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'Portfolio item removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (for chat user list)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email profilePhoto _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Follow/Unfollow user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('followers', 'name profilePhoto artisanLevel isVerified')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's following
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('following', 'name profilePhoto artisanLevel isVerified')
      .select('following');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId });
    }

    if (!wishlist.wishlistItems.some(item => item.title === req.body.title)) {
      wishlist.wishlistItems.push({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        images: req.body.images || [],
        tags: req.body.tags || [],
        priority: req.body.priority || 'Medium'
      });
    }

    await wishlist.save();
    res.json({ message: 'Added to wishlist successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('wishlistItems')
      .populate('inspirationBoards.items.reference');

    if (!wishlist) {
      return res.json({ wishlistItems: [], inspirationBoards: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create inspiration board
exports.createInspirationBoard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, isPublic } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId });
    }

    wishlist.inspirationBoards.push({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true
    });

    await wishlist.save();
    res.status(201).json({ message: 'Inspiration board created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to inspiration board
exports.addToInspirationBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { type, reference, model, title, description, image, url } = req.body;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const board = wishlist.inspirationBoards.id(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Inspiration board not found' });
    }

    board.items.push({
      type,
      reference,
      model,
      title,
      description,
      image,
      url
    });

    await wishlist.save();
    res.json({ message: 'Added to inspiration board successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user verification status (admin only)
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = isVerified;
    await user.save();

    res.json({ message: 'Verification status updated successfully', isVerified });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user activity feed
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('portfolio')
      .populate('reviews.reviewer', 'name profilePhoto');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent activity (this would be enhanced with actual activity tracking)
    const activity = {
      user,
      recentTrades: user.totalTrades,
      successfulTrades: user.successfulTrades,
      communityPoints: user.communityPoints,
      lastActive: user.lastActive
    };

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q, skills, location, artisanLevel } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { specialties: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (artisanLevel) {
      query.artisanLevel = artisanLevel;
    }

    const users = await User.find(query)
      .select('name profilePhoto artisanLevel skills location isVerified ratings totalTrades')
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add review for a user
exports.addReview = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (reviewerId === userId) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already reviewed this user
    const existingReview = user.reviews.find(review => 
      review.reviewer.toString() === reviewerId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this user' });
    }

    // Add the review
    user.reviews.push({
      reviewer: reviewerId,
      rating,
      comment,
      date: new Date()
    });

    // Calculate new average rating
    const totalRating = user.reviews.reduce((sum, review) => sum + review.rating, 0);
    user.ratings = totalRating / user.reviews.length;

    await user.save();

    const populatedUser = await User.findById(userId)
      .populate('reviews.reviewer', 'name profilePhoto');

    res.status(201).json({
      message: 'Review added successfully',
      user: populatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('reviews.reviewer', 'name profilePhoto')
      .select('reviews ratings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      reviews: user.reviews,
      averageRating: user.ratings,
      totalReviews: user.reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    const initialLength = wishlist.wishlistItems.length;
    wishlist.wishlistItems = wishlist.wishlistItems.filter(item => item._id.toString() !== itemId);
    if (wishlist.wishlistItems.length === initialLength) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    await wishlist.save();
    res.json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '590154599751-p9qpkbp2u13775vcasiassr0ka2iujsv.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let profilePhoto = '';
    if (picture) {
      const filename = `${Date.now()}-${email.replace(/[^a-zA-Z0-9]/g, '')}.jpg`;
      try {
        profilePhoto = await downloadImage(picture, filename);
      } catch (e) {
        profilePhoto = '';
      }
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        profilePhoto,
        password: Math.random().toString(36), // random password, not used
      });
      await user.save();
    } else if (!user.profilePhoto && profilePhoto) {
      user.profilePhoto = profilePhoto;
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
      }
    });
  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};