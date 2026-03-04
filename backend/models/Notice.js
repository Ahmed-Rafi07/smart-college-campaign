const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["exam", "event", "deadline", "holiday", "general"],
    default: "general",
  },
  priority: {
    type: String,
    enum: ["normal", "important", "urgent"],
    default: "normal",
  },
  targetAudience: {
    type: String,
    enum: ["all", "students", "teachers"],
    default: "all",
  },
  expiresAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Index for faster queries
NoticeSchema.index({ expiresAt: 1, isActive: 1 });
NoticeSchema.index({ createdAt: -1 });

// Expire old notices automatically
NoticeSchema.pre("find", function () {
  const now = new Date();
  this.where({ $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }] });
});

module.exports = mongoose.model("Notice", NoticeSchema);
