const express = require("express");
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getUrgentNotices,
  getNoticeStats,
} = require("../controllers/noticeController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Public routes (require authentication)
router.get("/", auth, getNotices);
router.get("/urgent", auth, getUrgentNotices);
router.get("/stats", auth, admin, getNoticeStats);
router.get("/:id", auth, getNoticeById);

// Admin only routes
router.post("/", auth, admin, createNotice);
router.put("/:id", auth, admin, updateNotice);
router.delete("/:id", auth, admin, deleteNotice);

module.exports = router;
