const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all active announcements
router.get('/', announcementController.getActiveAnnouncements);

// Get announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Create new announcement (admin only)
router.post('/', auth, auth.adminOnly, upload.single('image'), announcementController.createAnnouncement);

// Update announcement (admin only)
router.put('/:id', auth, auth.adminOnly, upload.single('image'), announcementController.updateAnnouncement);

// Mark announcement as read
router.post('/:id/read', auth, announcementController.markAsRead);

// Get unread announcements for user
router.get('/unread', auth, announcementController.getUnreadAnnouncements);

// Get announcement statistics (admin only)
router.get('/:id/stats', auth, auth.adminOnly, announcementController.getAnnouncementStats);

// Delete announcement (admin only)
router.delete('/:id', auth, auth.adminOnly, announcementController.deleteAnnouncement);

module.exports = router; 