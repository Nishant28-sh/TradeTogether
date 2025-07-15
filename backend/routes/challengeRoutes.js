const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all active challenges
router.get('/', challengeController.getActiveChallenges);

// Get user's challenges
router.get('/user/:userId?', auth, challengeController.getUserChallenges);

// Get challenge by ID
router.get('/:id', challengeController.getChallengeById);

// Create a new challenge (admin only)
router.post('/', auth, auth.adminOnly, upload.single('image'), challengeController.createChallenge);

// Join a challenge
router.post('/:challengeId/join', auth, challengeController.joinChallenge);

// Submit to challenge
router.post('/:challengeId/submit', auth, upload.array('images', 5), challengeController.submitToChallenge);

// Like/unlike a submission
router.post('/:challengeId/submissions/:submissionId/like', auth, challengeController.toggleSubmissionLike);

// Comment on submission
router.post('/:challengeId/submissions/:submissionId/comment', auth, challengeController.commentOnSubmission);

// Update challenge (admin only)
router.put('/:challengeId', auth, auth.adminOnly, upload.single('image'), challengeController.updateChallenge);

// Delete challenge (admin only)
router.delete('/:challengeId', auth, auth.adminOnly, challengeController.deleteChallenge);

module.exports = router; 