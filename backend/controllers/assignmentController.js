const Assignment = require("../models/Assignment");

// ADD ASSIGNMENT
exports.createAssignment = async (req, res) => {
  const { subjectId, title, dueDate } = req.body;

  try {
    const assignment = await Assignment.create({
      user: req.user.id,
      subject: subjectId,
      title,
      dueDate,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

// GET ASSIGNMENTS
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user.id });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};
