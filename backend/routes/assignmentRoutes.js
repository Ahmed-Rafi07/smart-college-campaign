const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const auth = require("../middleware/auth");

/* ADD ASSIGNMENT */
router.post("/", auth, async (req, res) => {
  try {
    const { title, subjectId, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const assignment = await Assignment.create({
      createdBy: req.user.id,
      title,
      subject: subjectId || null,
      dueDate: dueDate || null,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Add assignment error:", err);
    res.status(500).json({ message: "Failed to add assignment" });
  }
});

/* GET ALL ASSIGNMENTS */
router.get("/", auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.id })
      .populate("subject")
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

/* TOGGLE COMPLETE */
const toggleAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.completed = !assignment.completed;
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error("Toggle assignment error:", err);
    res.status(500).json({ message: "Failed to toggle assignment" });
  }
};

router.put("/:id/toggle", auth, toggleAssignment);
router.patch("/:id/toggle", auth, toggleAssignment);

/* DELETE */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Assignment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete assignment error:", err);
    res.status(500).json({ message: "Failed to delete assignment" });
  }
});

module.exports = router;
