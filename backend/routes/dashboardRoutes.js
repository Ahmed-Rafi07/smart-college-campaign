const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getStudentDashboard,
} = require("../controllers/dashboardController");

// 🔒 Protected route
router.get("/", protect, getStudentDashboard);

module.exports = router;
