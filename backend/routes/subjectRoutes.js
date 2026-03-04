const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");

/* ========================
   GET SUBJECTS
======================== */
router.get("/", auth, async (req, res) => {
  const subjects = await Subject.find({ user: req.user.id });
  res.json(subjects);
});

/* ========================
   ADD SUBJECT
======================== */
router.post("/", auth, async (req, res) => {
  const subject = await Subject.create({
    name: req.body.name,
    user: req.user.id,
  });
  res.json(subject);
});

/* ========================
   DELETE SUBJECT + ATTENDANCE
======================== */
router.delete("/:id", auth, async (req, res) => {
  await Subject.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  await Attendance.deleteMany({
    subject: req.params.id,
    user: req.user.id,
  });

  res.json({ message: "Subject and attendance deleted" });
});

module.exports = router;
