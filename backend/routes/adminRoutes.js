const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Attendance = require("../models/Attendance");
const LoginLog = require("../models/LoginLog");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

/* =========================
   ADMIN STATS
========================= */
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });

    res.json({
      totalUsers,
      totalStudents,
      totalAdmins,
      totalTeachers,
      totalFaculty: totalTeachers,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* =========================
   GET ALL USERS (Admin Only)
========================= */
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* =========================
   ANALYTICS (Admin Only)
========================= */
router.get("/analytics", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Active users (last 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await LoginLog.distinct("user", {
      createdAt: { $gte: since },
    });

    // Recent logins (last 5)
    const recentLogins = await LoginLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username email role");

    // Attendance summary
    const records = await Attendance.find();
    let totalClasses = records.length;
    let presentCount = records.filter((r) => r.status === "present").length;
    let avgAttendance =
      totalClasses === 0
        ? 0
        : Math.round((presentCount / totalClasses) * 100);

    res.json({
      totalUsers,
      totalStudents,
      totalAdmins,
      activeUsersCount: activeUsers.length,
      recentLogins,
      totalClasses,
      avgAttendance,
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

/* =========================
   CHARTS DATA (Admin Only)
========================= */
router.get("/charts", auth, adminOnly, async (req, res) => {
  try {
    // Users per day (last 7 days)
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    const userCounts = [];

    for (let date of last7Days) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $gte: start, $lt: end },
      });

      userCounts.push(count);
    }

    // Attendance trend (present % per day)
    const attendanceTrend = [];

    for (let date of last7Days) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      const records = await Attendance.find({
        createdAt: { $gte: start, $lt: end },
      });

      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const percent = total === 0 ? 0 : Math.round((present / total) * 100);

      attendanceTrend.push(percent);
    }

    res.json({
      labels: last7Days,
      userCounts,
      attendanceTrend,
    });
  } catch (err) {
    console.error("Charts error:", err);
    res.status(500).json({ message: "Failed to load charts" });
  }
});

/* =========================
   BLOCK / UNBLOCK USER
========================= */
router.put("/users/:id/block", auth, adminOnly, async (req, res) => {
  try {
    const { blocked } = req.body;

    await User.findByIdAndUpdate(req.params.id, { blocked });
    res.json({ message: blocked ? "User blocked" : "User unblocked" });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

/* =========================
   FORCE LOGOUT USER
========================= */
router.put("/users/:id/logout", auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { tokenVersion: Date.now() });
    res.json({ message: "User logged out from all devices" });
  } catch (err) {
    console.error("Force logout error:", err);
    res.status(500).json({ message: "Failed to logout user" });
  }
});

/* =========================
   RESET USER ATTENDANCE
========================= */
router.delete("/users/:id/attendance", auth, adminOnly, async (req, res) => {
  try {
    await Attendance.deleteMany({ user: req.params.id });
    res.json({ message: "Attendance reset successfully" });
  } catch (err) {
    console.error("Reset attendance error:", err);
    res.status(500).json({ message: "Failed to reset attendance" });
  }
});

/* =========================
   BROADCAST NOTICE
========================= */
router.post("/broadcast", auth, adminOnly, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Notice message is required" });
    }

    // You can store this in Notice collection if you have one
    console.log("Broadcast Notice:", message);

    res.json({ message: "Notice broadcasted to all users" });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ message: "Failed to broadcast notice" });
  }
});

module.exports = router;
