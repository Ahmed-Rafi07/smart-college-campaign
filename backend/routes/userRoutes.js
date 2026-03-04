const express = require("express");
const User = require("../models/user");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get user profile
router.get("/profile/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put("/profile/:id", protect, async (req, res) => {
  try {
    const { name, avatar, theme } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, avatar, theme },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student only
router.get("/student-data", protect, allowRoles("student"), (req, res) => {
  res.json({ message: "Student dashboard data" });
});

// Admin only
router.get("/admin-data", protect, allowRoles("admin"), (req, res) => {
  res.json({ message: "Admin dashboard data" });
});

module.exports = router;
