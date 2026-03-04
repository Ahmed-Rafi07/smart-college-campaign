const Notice = require("../models/Notice");

// @desc    Get all active notices (with filtering)
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const { type, priority, search, limit = 50 } = req.query;

    const query = { isActive: true };

    // Filter by type
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by priority
    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // Search in title and message
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Only show notices for user's role
    if (req.user.role === "student") {
      query.targetAudience = { $in: ["all", "students"] };
    } else if (req.user.role === "teacher") {
      query.targetAudience = { $in: ["all", "teachers"] };
    }

    // Check expiry
    const now = new Date();
    query.$or = [{ expiresAt: { $gte: now } }, { expiresAt: null }];

    const notices = await Notice.find(query)
      .populate("createdBy", "name email")
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit));

    // Sort by priority (urgent > important > normal)
    const priorityOrder = { urgent: 3, important: 2, normal: 1 };
    notices.sort(
      (a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority] ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new notice (Admin only)
// @route   POST /api/notices
// @access  Private/Admin
exports.createNotice = async (req, res) => {
  try {
    const { title, message, type, priority, targetAudience, expiresAt } =
      req.body;

    // Validation
    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    const notice = await Notice.create({
      title,
      message,
      type: type || "general",
      priority: priority || "normal",
      targetAudience: targetAudience || "all",
      expiresAt: expiresAt || null,
      createdBy: req.user.id,
    });

    const populatedNotice = await Notice.findById(notice._id).populate(
      "createdBy",
      "name email"
    );

    res.status(201).json(populatedNotice);
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update notice (Admin only)
// @route   PUT /api/notices/:id
// @access  Private/Admin
exports.updateNotice = async (req, res) => {
  try {
    const { title, message, type, priority, targetAudience, expiresAt } =
      req.body;

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Update fields
    if (title) notice.title = title;
    if (message) notice.message = message;
    if (type) notice.type = type;
    if (priority) notice.priority = priority;
    if (targetAudience) notice.targetAudience = targetAudience;
    if (expiresAt !== undefined) notice.expiresAt = expiresAt;

    await notice.save();

    const updatedNotice = await Notice.findById(notice._id).populate(
      "createdBy",
      "name email"
    );

    res.json(updatedNotice);
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private/Admin
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Soft delete - just mark as inactive
    notice.isActive = false;
    await notice.save();

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get urgent notices for dashboard
// @route   GET /api/notices/urgent
// @access  Private
exports.getUrgentNotices = async (req, res) => {
  try {
    const now = new Date();

    const query = {
      isActive: true,
      priority: "urgent",
      $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }],
    };

    // Filter by user role
    if (req.user.role === "student") {
      query.targetAudience = { $in: ["all", "students"] };
    } else if (req.user.role === "teacher") {
      query.targetAudience = { $in: ["all", "teachers"] };
    }

    const urgentNotices = await Notice.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(urgentNotices);
  } catch (error) {
    console.error("Error fetching urgent notices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get notice stats (Admin)
// @route   GET /api/notices/stats
// @access  Private/Admin
exports.getNoticeStats = async (req, res) => {
  try {
    const now = new Date();

    const totalActive = await Notice.countDocuments({
      isActive: true,
      $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }],
    });

    const urgentCount = await Notice.countDocuments({
      isActive: true,
      priority: "urgent",
      $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }],
    });

    const byType = await Notice.aggregate([
      {
        $match: {
          isActive: true,
          $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }],
        },
      },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.json({
      totalActive,
      urgentCount,
      byType,
    });
  } catch (error) {
    console.error("Error fetching notice stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
