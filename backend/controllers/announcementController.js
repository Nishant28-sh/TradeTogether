const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Get all active announcements
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const { type, priority, targetAudience } = req.query;
    let query = { 
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name profilePhoto')
      .populate('community', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name profilePhoto')
      .populate('community', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Increment view count
    announcement.stats.views += 1;
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new announcement (admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      isPinned,
      image,
      link,
      tags,
      expiresAt,
      community
    } = req.body;

    const announcement = new Announcement({
      title,
      content,
      type,
      priority,
      targetAudience,
      isPinned: isPinned || false,
      image,
      link,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      community,
      createdBy: req.user.id
    });

    const savedAnnouncement = await announcement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update announcement (admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    Object.assign(announcement, updateData);
    await announcement.save();

    res.json({ message: 'Announcement updated successfully', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark announcement as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      await announcement.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread announcements for user
exports.getUnreadAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let targetAudienceQuery = ['All Users'];
    if (user.isArtisan) targetAudienceQuery.push('Artisans Only');
    if (user.isVerified) targetAudienceQuery.push('Verified Users');

    const unreadAnnouncements = await Announcement.find({
      isActive: true,
      targetAudience: { $in: targetAudienceQuery },
      readBy: { $ne: userId },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('createdBy', 'name profilePhoto')
    .populate('community', 'name')
    .sort({ isPinned: -1, createdAt: -1 });

    res.json(unreadAnnouncements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcement statistics
exports.getAnnouncementStats = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const stats = {
      views: announcement.stats.views,
      clicks: announcement.stats.clicks,
      readCount: announcement.readBy.length,
      engagementRate: announcement.stats.views > 0 ? 
        (announcement.readBy.length / announcement.stats.views * 100).toFixed(2) : 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete announcement (admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 