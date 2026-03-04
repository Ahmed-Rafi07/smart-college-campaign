const express = require("express");
const Activity = require("../models/Activity");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create activity log
router.post("/", protect, async (req, res) => {
  try {
    const { message, type, relatedId } = req.body;
    
    const activity = await Activity.create({
      userId: req.user.id,
      message,
      type,
      relatedId,
    });

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's activity logs (latest 10)
router.get("/user/:userId", async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all activities (admin)
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
