const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all communities
router.get('/', communityController.getCommunities);

// Create a new community
router.post('/', auth, upload.single('image'), communityController.createCommunity);

// Join a community
router.post('/:id/join', auth, communityController.joinCommunity);

// Request to join a community (pending approval)
router.post('/:id/join-request', auth, communityController.sendJoinRequest);
// Get pending join requests (admin only)
router.get('/:id/requests', auth, communityController.getPendingRequests);
// Approve join request (admin only)
router.post('/:id/approve-request', auth, communityController.approveRequest);

// Community events
router.get('/:communityId/events', communityController.getEvents);
router.post('/:communityId/events', auth, communityController.createEvent);

// Community event participation - using simple route
router.post('/event-join', auth, communityController.joinEvent);

// Community posts
router.get('/:communityId/posts', communityController.getPosts);
router.post('/:communityId/posts', auth, communityController.createPost);

// Community post interactions - using simple routes
router.post('/post-like', auth, communityController.toggleLike);
router.post('/post-comment', auth, communityController.addComment);

// Add a route to delete all communities
router.delete('/all', auth, communityController.deleteAllCommunities);

// Add a route to delete a specific community (admin only)
router.delete('/:id', auth, communityController.deleteCommunity);

module.exports = router; 