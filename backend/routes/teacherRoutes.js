const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const teacherOnly = require("../middleware/teacherOnly");

const Subject = require("../models/Subject");
const Assignment = require("../models/Assignment");
const Note = require("../models/Note");
const Exam = require("../models/Exam");
const Attendance = require("../models/Attendance");

/* ========================
   CREATE SUBJECT (TEACHER)
======================== */
router.post("/subjects", auth, teacherOnly, async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const subject = await Subject.create({
      name,
      code: code || "",
      user: req.user.id,
    });

    res.status(201).json(subject);
  } catch (err) {
    console.error("Create subject error:", err);
    res.status(500).json({ message: "Failed to create subject" });
  }
});

/* ========================
   GET TEACHER'S SUBJECTS
======================== */
router.get("/subjects", auth, teacherOnly, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id });
    res.json(subjects);
  } catch (err) {
    console.error("Get subjects error:", err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

/* ========================
   CREATE ASSIGNMENT
======================== */
router.post("/assignments", auth, teacherOnly, async (req, res) => {
  try {
    const { title, subjectId, description, dueDate } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({ message: "Title and subject are required" });
    }

    const assignment = await Assignment.create({
      title,
      description: description || "",
      subject: subjectId,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user.id,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ message: "Failed to create assignment" });
  }
});

/* ========================
   GET ASSIGNMENTS FOR SUBJECT
======================== */
router.get("/assignments/:subjectId", auth, teacherOnly, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      subject: req.params.subjectId,
      createdBy: req.user.id,
    }).populate("subject");

    res.json(assignments);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

/* ========================
   UPLOAD NOTES
======================== */
router.post("/notes", auth, teacherOnly, async (req, res) => {
  try {
    const { title, subjectId, content, tags } = req.body;

    if (!title || !subjectId || !content) {
      return res.status(400).json({ message: "Title, subject, and content are required" });
    }

    const note = await Note.create({
      title,
      subject: subjectId,
      content,
      uploadedBy: req.user.id,
      tags: tags || [],
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Failed to create note" });
  }
});

/* ========================
   GET NOTES FOR SUBJECT
======================== */
router.get("/notes/:subjectId", auth, teacherOnly, async (req, res) => {
  try {
    const notes = await Note.find({
      subject: req.params.subjectId,
      uploadedBy: req.user.id,
    }).populate("subject");

    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

/* ========================
   CREATE EXAM
======================== */
router.post("/exams", auth, teacherOnly, async (req, res) => {
  try {
    const { title, subjectId, date, time } = req.body;

    if (!title || !subjectId || !date) {
      return res.status(400).json({ message: "Title, subject, and date are required" });
    }

    const exam = await Exam.create({
      title,
      subject: subjectId,
      date,
      time: time || "",
      createdBy: req.user.id,
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error("Create exam error:", err);
    res.status(500).json({ message: "Failed to create exam" });
  }
});

/* ========================
   GET EXAMS FOR SUBJECT
======================== */
router.get("/exams/:subjectId", auth, teacherOnly, async (req, res) => {
  try {
    const exams = await Exam.find({
      subject: req.params.subjectId,
      createdBy: req.user.id,
    }).populate("subject");

    res.json(exams);
  } catch (err) {
    console.error("Get exams error:", err);
    res.status(500).json({ message: "Failed to fetch exams" });
  }
});

/* ========================
   VIEW CLASS ATTENDANCE
======================== */
router.get("/attendance/:subjectId", auth, teacherOnly, async (req, res) => {
  try {
    const records = await Attendance.find({ subject: req.params.subjectId })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    // Calculate attendance statistics
    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const attendanceRate =
      totalRecords === 0 ? 0 : Math.round((presentCount / totalRecords) * 100);

    res.json({
      records,
      statistics: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        attendanceRate,
      },
    });
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

module.exports = router;
