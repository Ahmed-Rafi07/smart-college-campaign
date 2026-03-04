const Attendance = require("../models/Attendance");

/* =========================
   MARK ATTENDANCE
========================= */
exports.markAttendance = async (req, res) => {
  const { subjectId, status } = req.body;
  const userId = req.user.id;

  const today = new Date().toISOString().split("T")[0];

  try {
    // update if already marked today
    const attendance = await Attendance.findOneAndUpdate(
      { user: userId, subject: subjectId, date: today },
      { status },
      { new: true, upsert: true }
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};

/* =========================
   GET ATTENDANCE SUMMARY
========================= */
exports.getAttendanceSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const records = await Attendance.find({ user: userId });

    const summary = {};

    records.forEach((rec) => {
      if (!summary[rec.subject]) {
        summary[rec.subject] = { total: 0, present: 0 };
      }
      summary[rec.subject].total += 1;
      if (rec.status === "present") {
        summary[rec.subject].present += 1;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
