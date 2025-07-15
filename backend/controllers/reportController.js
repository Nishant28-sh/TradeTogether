const Report = require('../models/Report');
const User = require('../models/User');
const Community = require('../models/Community');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const {
      reportedUser,
      reportedContent,
      reason,
      description,
      evidence
    } = req.body;

    const report = new Report({
      reporter: req.user.id,
      reportedUser,
      reportedContent: {
        type: reportedContent.type,
        contentId: reportedContent.contentId,
        model: reportedContent.model
      },
      reason,
      description,
      evidence: evidence ? evidence.split(',').map(e => e.trim()) : []
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all reports (admin/moderator only)
exports.getAllReports = async (req, res) => {
  try {
    const { status, priority, reason } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (reason) query.reason = reason;

    const reports = await Report.find(query)
      .populate('reporter', 'name profilePhoto')
      .populate('reportedUser', 'name profilePhoto')
      .populate('assignedTo', 'name profilePhoto')
      .populate('resolution.resolvedBy', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name profilePhoto')
      .populate('reportedUser', 'name profilePhoto')
      .populate('assignedTo', 'name profilePhoto')
      .populate('resolution.resolvedBy', 'name profilePhoto');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign report to moderator
exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.assignedTo = assignedTo;
    report.status = 'Under Review';
    await report.save();

    res.json({ message: 'Report assigned successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resolve report
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'Resolved';
    report.isResolved = true;
    report.resolution = {
      action,
      notes,
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    };

    // Take action based on resolution
    if (action === 'Warning') {
      // Send warning to user
      console.log(`Warning sent to user ${report.reportedUser}`);
    } else if (action === 'Content Removal') {
      // Remove the reported content
      await removeReportedContent(report.reportedContent);
    } else if (action === 'Temporary Ban') {
      // Temporarily ban user
      await User.findByIdAndUpdate(report.reportedUser, {
        $set: { isBanned: true, banExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
      });
    } else if (action === 'Permanent Ban') {
      // Permanently ban user
      await User.findByIdAndUpdate(report.reportedUser, {
        $set: { isBanned: true, banExpiresAt: null }
      });
    }

    await report.save();
    res.json({ message: 'Report resolved successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports by user
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const reports = await Report.find({
      $or: [
        { reporter: userId },
        { reportedUser: userId }
      ]
    })
    .populate('reporter', 'name profilePhoto')
    .populate('reportedUser', 'name profilePhoto')
    .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get moderation statistics
exports.getModerationStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const underReviewReports = await Report.countDocuments({ status: 'Under Review' });
    const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

    const reportsByReason = await Report.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]);

    const reportsByAction = await Report.aggregate([
      { $match: { 'resolution.action': { $exists: true } } },
      { $group: { _id: '$resolution.action', count: { $sum: 1 } } }
    ]);

    const stats = {
      total: totalReports,
      pending: pendingReports,
      underReview: underReviewReports,
      resolved: resolvedReports,
      byReason: reportsByReason,
      byAction: reportsByAction
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to remove reported content
async function removeReportedContent(reportedContent) {
  try {
    switch (reportedContent.type) {
      case 'Post':
        // Remove post from community
        await Community.updateMany(
          { 'posts._id': reportedContent.contentId },
          { $pull: { posts: { _id: reportedContent.contentId } } }
        );
        break;
      case 'Comment':
        // Remove comment from post
        await Community.updateMany(
          { 'posts.comments._id': reportedContent.contentId },
          { $pull: { 'posts.$.comments': { _id: reportedContent.contentId } } }
        );
        break;
      case 'Product':
        // Remove product
        await require('../models/Product').findByIdAndDelete(reportedContent.contentId);
        break;
      // Add more cases as needed
    }
  } catch (error) {
    console.error('Error removing reported content:', error);
  }
} 