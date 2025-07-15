const Community = require('../models/Community');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all communities
exports.getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'name profilePhoto')
      .populate('featuredArtisans', 'name profilePhoto artisanLevel');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new community
exports.createCommunity = async (req, res) => {
  try {
    const rules = req.body.rules ? JSON.parse(req.body.rules) : [];
    // Save only the relative path for the image
    const image = req.file ? `uploads/${req.file.filename}` : null;
    const { name, description, category, isPrivate } = req.body;
    const community = new Community({
      name,
      description,
      category,
      isPrivate,
      rules,
      image,
      admins: [req.user.id],
      members: [req.user.id]
    });
    const savedCommunity = await community.save();
    res.status(201).json(savedCommunity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Join a community
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    
    community.members.push(req.user.id);
    await community.save();
    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create an event
exports.createEvent = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { title, description, date, duration, type, maxParticipants, materials, price, image } = req.body;
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    const event = {
      title,
      description,
      date: new Date(date),
      duration,
      type,
      host: req.user.id,
      maxParticipants,
      materials,
      price,
      image
    };
    
    community.events.push(event);
    await community.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get community events
exports.getEvents = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId)
      .populate('events.host', 'name profilePhoto');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community.events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join an event
exports.joinEvent = async (req, res) => {
  try {
    const { communityId, eventId } = req.body; // Changed from req.params/req.query to req.body
    
    if (!communityId || !eventId) {
      return res.status(400).json({ message: 'Community ID and Event ID are required' });
    }
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    const event = community.events.id(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    event.participants.push(req.user.id);
    await community.save();
    res.json({ message: 'Joined event successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { content, images, tags, isInspiration } = req.body;
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    const post = {
      author: req.user.id,
      content,
      images,
      tags,
      isInspiration
    };
    
    community.posts.push(post);
    await community.save();
    
    const populatedPost = await Community.findById(communityId)
      .populate('posts.author', 'name profilePhoto');
    
    res.status(201).json(populatedPost.posts[populatedPost.posts.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get community posts
exports.getPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId)
      .populate('posts.author', 'name profilePhoto')
      .populate('posts.comments.author', 'name profilePhoto');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community.posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { communityId, postId } = req.body; // Changed from req.params/req.query to req.body
    
    if (!communityId || !postId) {
      return res.status(400).json({ message: 'Community ID and Post ID are required' });
    }
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    const post = community.posts.id(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user.id);
    }
    
    await community.save();
    res.json({ message: likeIndex > -1 ? 'Post unliked' : 'Post liked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { communityId, postId, content } = req.body; // Changed from req.params/req.query to req.body
    
    if (!communityId || !postId || !content) {
      return res.status(400).json({ message: 'Community ID, Post ID, and content are required' });
    }
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    const post = community.posts.id(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      author: req.user.id,
      content
    });
    
    await community.save();
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Request to join a community (pending approval)
exports.requestJoinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    if (community.pendingRequests.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already requested to join' });
    }
    community.pendingRequests.push(req.user.id);
    await community.save();
    res.json({ message: 'Join request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending join requests (admin only)
exports.getPendingRequests = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('pendingRequests', 'name email profilePhoto');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    if (!community.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can view requests' });
    }
    res.json(community.pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve join request (admin only)
exports.approveJoinRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    if (!community.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can approve requests' });
    }
    const userId = req.params.userId;
    const reqIndex = community.pendingRequests.indexOf(userId);
    if (reqIndex === -1) {
      return res.status(400).json({ message: 'No such pending request' });
    }
    community.pendingRequests.splice(reqIndex, 1);
    if (!community.members.includes(userId)) {
      community.members.push(userId);
    }
    await community.save();
    res.json({ message: 'User approved and added to community' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject join request (admin only)
exports.rejectJoinRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    if (!community.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can reject requests' });
    }
    const userId = req.params.userId;
    const reqIndex = community.pendingRequests.indexOf(userId);
    if (reqIndex === -1) {
      return res.status(400).json({ message: 'No such pending request' });
    }
    community.pendingRequests.splice(reqIndex, 1);
    await community.save();
    res.json({ message: 'User request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific community (admin only)
exports.deleteCommunity = async (req, res) => {
  try {
    const communityId = mongoose.Types.ObjectId.isValid(req.params.id) ? new mongoose.Types.ObjectId(req.params.id) : null;
    if (!communityId) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    // Removed admin check: allow any user to delete
    await Community.findByIdAndDelete(communityId);
    res.status(200).json({ message: 'Community deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all communities
exports.deleteAllCommunities = async (req, res) => {
  try {
    await Community.deleteMany({});
    res.status(200).json({ message: 'All communities deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

// --- JOIN REQUEST SYSTEM START ---

// User sends join request
exports.sendJoinRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (
      community.members.includes(req.user.id) ||
      (community.pendingRequests && community.pendingRequests.includes(req.user.id))
    ) {
      return res.status(400).json({ message: "Already a member or request pending" });
    }

    community.pendingRequests = community.pendingRequests || [];
    community.pendingRequests.push(req.user.id);
    await community.save();
    res.json({ message: "Join request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin views pending requests
exports.getPendingRequests = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('pendingRequests', 'name email');
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Only admin can view
    if (!community.admins.map(a => a.toString()).includes(req.user.id.toString())) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(community.pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin approves request
exports.approveRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Only admin can approve
    if (!community.admins.map(a => a.toString()).includes(req.user.id.toString())) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userId = req.body.userId;
    if (!community.pendingRequests.map(id => id.toString()).includes(userId)) {
      return res.status(400).json({ message: "No such request" });
    }

    community.pendingRequests = community.pendingRequests.filter(
      id => id.toString() !== userId
    );
    community.members.push(userId);
    await community.save();
    res.json({ message: "User approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- JOIN REQUEST SYSTEM END --- 