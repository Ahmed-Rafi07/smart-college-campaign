const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const auth = require("../middleware/auth");

/* ADD EXAM */
router.post("/", auth, async (req, res) => {
  try {
    const { title, subject, dateTime } = req.body;

    // Validate required fields
    if (!title || !subject || !dateTime) {
      return res.status(400).json({ message: "Title, subject, and dateTime are required" });
    }

    // Validate subject ObjectId format
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ 
        message: "Invalid subject ID format. Please select a valid subject.",
        hint: "Subject must be a valid MongoDB ObjectId"
      });
    }

    // Verify subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ 
        message: "Subject not found. Please select an existing subject.",
        hint: "The subject may have been deleted"
      });
    }

    const exam = await Exam.create({
      title,
      subject,
      dateTime,
      createdBy: req.user.id,
    });

    // Populate subject details before sending response
    const populatedExam = await Exam.findById(exam._id).populate("subject", "name code");

    console.log("📘 Exam created:", exam._id);
    res.json(populatedExam);
  } catch (err) {
    console.error("📘 Create Exam Error:", err.message);
    
    // Handle mongoose validation or cast errors
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid subject ID format" });
    }
    
    res.status(500).json({ message: "Failed to create exam" });
  }
});

/* GET USER EXAMS */
router.get("/", auth, async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user.id })
      .populate("subject", "name code") // ✅ Populate subject details
      .sort({ dateTime: 1 });
    
    console.log("📘 Found exams:", exams.length);
    res.json(exams);
  } catch (err) {
    console.error("📘 Fetch Exams Error:", err.message);
    res.status(500).json({ message: "Failed to fetch exams" });
  }
});

/* DELETE EXAM */
router.delete("/:id", auth, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    console.log("📘 Exam deleted:", req.params.id);
    res.json({ message: "Exam deleted" });
  } catch (err) {
    console.error("📘 Delete Exam Error:", err.message);
    res.status(500).json({ message: "Failed to delete exam" });
  }
});

module.exports = router;
