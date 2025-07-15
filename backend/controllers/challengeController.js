const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Get all active challenges
exports.getActiveChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ 
      isActive: true,
      endDate: { $gte: new Date() }
    })
    .populate('createdBy', 'name profilePhoto')
    .populate('community', 'name')
    .sort({ startDate: 1 });

    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name profilePhoto')
      .populate('participants', 'name profilePhoto')
      .populate('submissions.participant', 'name profilePhoto')
      .populate('community', 'name');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new challenge
exports.createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      theme,
      startDate,
      endDate,
      maxParticipants,
      rules,
      requirements,
      prizes,
      tags,
      difficulty,
      community
    } = req.body;

    const challenge = new Challenge({
      title,
      description,
      category,
      theme,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxParticipants,
      rules: rules ? rules.split('\n').map(r => r.trim()).filter(Boolean) : [],
      requirements: requirements ? requirements.split('\n').map(r => r.trim()).filter(Boolean) : [],
      prizes: prizes ? JSON.parse(prizes) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      difficulty,
      community,
      createdBy: req.user.id
    });

    // Handle image upload
    if (req.file) {
      challenge.image = req.file.path;
    }

    const savedChallenge = await challenge.save();
    res.status(201).json(savedChallenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.isActive) {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    if (challenge.participants.includes(userId)) {
      return res.status(400).json({ message: 'Already participating in this challenge' });
    }

    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      return res.status(400).json({ message: 'Challenge is full' });
    }

    challenge.participants.push(userId);
    await challenge.save();

    res.json({ message: 'Joined challenge successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit to challenge
exports.submitToChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { title, description, images, videoUrl } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.participants.includes(userId)) {
      return res.status(400).json({ message: 'Must join challenge before submitting' });
    }

    // Check if user already submitted
    const existingSubmission = challenge.submissions.find(
      sub => sub.participant.toString() === userId
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Already submitted to this challenge' });
    }

    challenge.submissions.push({
      participant: userId,
      title,
      description,
      images: images ? images.split(',') : [],
      videoUrl
    });

    await challenge.save();
    res.status(201).json({ message: 'Submission successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a submission
exports.toggleSubmissionLike = async (req, res) => {
  try {
    const { challengeId, submissionId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const submission = challenge.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const likeIndex = submission.likes.indexOf(userId);
    if (likeIndex > -1) {
      submission.likes.splice(likeIndex, 1);
    } else {
      submission.likes.push(userId);
    }

    await challenge.save();
    res.json({ message: likeIndex > -1 ? 'Unliked' : 'Liked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on submission
exports.commentOnSubmission = async (req, res) => {
  try {
    const { challengeId, submissionId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const submission = challenge.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.comments.push({
      author: userId,
      content
    });

    await challenge.save();
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's challenges
exports.getUserChallenges = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    console.log('getUserChallenges: userId =', userId, 'req.user =', req.user);
    if (!userId) {
      console.error('getUserChallenges: No userId found');
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const participatingChallenges = await Challenge.find({
      participants: userId,
      isActive: true
    })
    .populate('createdBy', 'name profilePhoto')
    .sort({ startDate: 1 });

    const createdChallenges = await Challenge.find({
      createdBy: userId
    })
    .populate('participants', 'name profilePhoto')
    .sort({ createdAt: -1 });

    res.json({
      participating: participatingChallenges,
      created: createdChallenges
    });
  } catch (error) {
    console.error('getUserChallenges error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update challenge (admin only)
exports.updateChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const updateData = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Handle image upload
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Parse complex fields
    if (updateData.rules) {
      updateData.rules = updateData.rules.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (updateData.requirements) {
      updateData.requirements = updateData.requirements.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (updateData.prizes) {
      updateData.prizes = JSON.parse(updateData.prizes);
    }
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    // Handle dates
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name profilePhoto');

    res.json({ message: 'Challenge updated successfully', challenge: updatedChallenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete challenge (admin only)
exports.deleteChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findByIdAndDelete(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 