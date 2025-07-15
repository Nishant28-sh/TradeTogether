const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (require authentication)
router.get('/user/:userId?', auth, eventController.getUserEvents);
router.post('/:eventId/register', auth, eventController.registerForEvent);
router.post('/:eventId/unregister', auth, eventController.unregisterFromEvent);

// Admin-only routes
router.post('/', auth, auth.adminOnly, upload.single('image'), eventController.createEvent);
router.put('/:id', auth, auth.adminOnly, upload.single('image'), eventController.updateEvent);
router.delete('/:id', auth, auth.adminOnly, eventController.deleteEvent);
router.get('/creator/:creatorId', auth, auth.adminOnly, eventController.getEventsByCreator);
router.post('/:id/toggle-featured', auth, auth.adminOnly, eventController.toggleFeatured);

module.exports = router; 