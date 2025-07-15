const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a new report
router.post('/', auth, upload.array('evidence', 5), reportController.createReport);

// Get all reports (admin/moderator only)
router.get('/', auth, reportController.getAllReports);

// Get report by ID
router.get('/:id', auth, reportController.getReportById);

// Assign report to moderator
router.post('/:id/assign', auth, reportController.assignReport);

// Resolve report
router.post('/:id/resolve', auth, reportController.resolveReport);

// Get reports by user
router.get('/user/:userId?', auth, reportController.getUserReports);

// Get moderation statistics (admin only)
router.get('/stats', auth, reportController.getModerationStats);

module.exports = router; 