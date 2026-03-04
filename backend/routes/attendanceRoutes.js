const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const ClassCode = require("../models/ClassCode");
const auth = require("../middleware/auth");
const isTeacher = require("../middleware/isTeacher");
const multer = require("multer");
const path = require("path");

// 📸 Multer configuration for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/attendance/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + req.user.id + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/* ========================
   MARK ATTENDANCE WITH PROOF
======================== */
router.post("/", auth, upload.single("proofPhoto"), async (req, res) => {
  try {
    console.log("Attendance mark body:", req.body);
    console.log("Attendance mark user:", req.user && req.user.id);
    const { subjectId, status, latitude, longitude, accuracy, classCode } = req.body;
    const parsedLatitude =
      latitude === undefined || latitude === "" ? null : Number(latitude);
    const parsedLongitude =
      longitude === undefined || longitude === "" ? null : Number(longitude);
    const parsedAccuracy =
      accuracy === undefined || accuracy === "" ? null : Number(accuracy);
    const hasLocation =
      Number.isFinite(parsedLatitude) || Number.isFinite(parsedLongitude);
    const needsProof = status !== "absent";

    // ✅ At least ONE proof must be provided
    if (
      needsProof &&
      !req.file &&
      !hasLocation &&
      !classCode
    ) {
      return res.status(400).json({
        message: "Provide at least one proof: photo OR GPS OR class code"
      });
    }

    // Validate class code if provided
    if (classCode) {
      const validCode = await ClassCode.findOne({
        code: classCode,
        subject: subjectId,
        active: true,
        expiresAt: { $gt: new Date() },
      });

      if (!validCode) {
        return res.status(400).json({ message: "Invalid or expired class code" });
      }

      // Check if already used by this student
      if (validCode.usedBy.includes(req.user.id)) {
        return res.status(400).json({ message: "Code already used" });
      }

      // Mark code as used by this student
      validCode.usedBy.push(req.user.id);
      await validCode.save();
    }

    // Create attendance record with proof
    const attendance = await Attendance.create({
      user: req.user.id,
      subject: subjectId,
      status,
      proofPhoto: req.file ? req.file.path : null,
      location: {
        latitude: Number.isFinite(parsedLatitude) ? parsedLatitude : null,
        longitude: Number.isFinite(parsedLongitude) ? parsedLongitude : null,
        accuracy: Number.isFinite(parsedAccuracy) ? parsedAccuracy : null,
      },
      classCode: classCode || null,
      verified: false,
    });

    // Recalculate totals for this subject
    const records = await Attendance.find({
      user: req.user.id,
      subject: subjectId,
    });

    let total = records.length;
    let present = records.filter((r) => r.status === "present").length;

    res.json({ 
      attendance,
      summary: { total, present },
      message: "Attendance marked with proof"
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    res.status(500).json({ message: err.message || "Failed to mark attendance" });
  }
});


/* ========================
   ATTENDANCE SUMMARY
======================== */
router.get("/summary", auth, async (req, res) => {
  const records = await Attendance.find({ user: req.user.id });

  const summary = {};
  let totalClasses = 0;
  let totalPresent = 0;

  records.forEach((r) => {
    const key = r.subject.toString();

    if (!summary[key]) {
      summary[key] = { total: 0, present: 0 };
    }

    summary[key].total += 1;
    totalClasses += 1;

    if (r.status === "present") {
      summary[key].present += 1;
      totalPresent += 1;
    }
  });

  res.json({
    bySubject: summary,
    overall: {
      totalClasses,
      totalPresent,
      percentage:
        totalClasses === 0
          ? 0
          : Math.round((totalPresent / totalClasses) * 100),
    },
  });
});

/* ========================
   ATTENDANCE HISTORY
======================== */
router.get("/history", auth, async (req, res) => {
  const records = await Attendance.find({ user: req.user.id })
    .populate("subject", "name")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(records);
});

/* ========================
   ADMIN - VIEW ALL ATTENDANCE
======================== */
router.get("/admin/all", auth, isTeacher, async (req, res) => {
  const records = await Attendance.find()
    .populate("user", "username email")
    .populate("subject", "name")
    .sort({ createdAt: -1 });

  res.json(records);
});

/* ========================
   🔐 TEACHER - GENERATE CLASS CODE
======================== */
router.post("/class-code/generate", auth, isTeacher, async (req, res) => {
  try {
    const { subjectId, expiryMinutes = 5 } = req.body;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    const classCode = await ClassCode.create({
      code,
      subject: subjectId,
      teacher: req.user.id,
      expiresAt,
      active: true,
    });

    res.json({
      code: classCode.code,
      expiresAt: classCode.expiresAt,
      message: `Code valid for ${expiryMinutes} minutes`,
    });
  } catch (err) {
    console.error("Generate code error:", err);
    res.status(500).json({ message: "Failed to generate code" });
  }
});

/* ========================
   🔐 TEACHER - GET ACTIVE CODES
======================== */
router.get("/class-code/active", auth, isTeacher, async (req, res) => {
  try {
    const activeCodes = await ClassCode.find({
      teacher: req.user.id,
      active: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.json(activeCodes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch codes" });
  }
});

/* ========================
   🔐 TEACHER - DEACTIVATE CODE
======================== */
router.delete("/class-code/:codeId", auth, isTeacher, async (req, res) => {
  try {
    await ClassCode.findByIdAndUpdate(req.params.codeId, { active: false });
    res.json({ message: "Code deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to deactivate code" });
  }
});

/* ========================
   📸 TEACHER - VIEW ATTENDANCE PROOFS
======================== */
router.get("/proofs/:subjectId", auth, isTeacher, async (req, res) => {
  try {
    const records = await Attendance.find({
      subject: req.params.subjectId,
      $or: [
        { proofPhoto: { $ne: null } },
        { "location.latitude": { $ne: null } },
        { classCode: { $ne: null } },
      ],
    })
      .populate("user", "username email")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch proofs" });
  }
});

/* ========================
   📸 TEACHER - VIEW ATTENDANCE PROOFS (QUERY)
======================== */
router.get("/proofs", auth, isTeacher, async (req, res) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    const records = await Attendance.find({
      subject,
      $or: [
        { proofPhoto: { $ne: null } },
        { "location.latitude": { $ne: null } },
        { classCode: { $ne: null } },
      ],
    })
      .populate("user", "username email")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch proofs" });
  }
});

/* ========================
   📸 TEACHER - VERIFY ATTENDANCE PROOF
======================== */
router.patch("/verify/:attendanceId", auth, isTeacher, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.attendanceId,
      { verified: true },
      { new: true }
    );

    res.json({ message: "Attendance verified", attendance });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify" });
  }
});

module.exports = router;
