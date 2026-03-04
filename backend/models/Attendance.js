const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // 📸 Proof of Presence Fields
    proofPhoto: {
      type: String, // file path to uploaded selfie
      default: null,
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
    },
    classCode: {
      type: String, // code entered by student
      default: null,
    },
    verified: {
      type: Boolean,
      default: false, // admin/teacher can verify proof
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
