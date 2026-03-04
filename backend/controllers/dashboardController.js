exports.getStudentDashboard = async (req, res) => {
  try {
    // Later this will come from DB
    res.json({
      attendance: "85%",
      assignments: 2,
      nextExam: "DBMS · Feb 15",
      reminders: [
        "Math Assignment – Tomorrow",
        "DBMS Exam – Feb 15",
        "Seminar – Friday",
      ],
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};
