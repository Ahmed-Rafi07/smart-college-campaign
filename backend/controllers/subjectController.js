const Subject = require("../models/Subject");

/**
 * @desc Create a subject
 * @route POST /api/subjects
 * @access Private
 */
exports.createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const subject = await Subject.create({
      name,
      code,
      user: req.user.id,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to create subject" });
  }
};

/**
 * @desc Get logged-in user's subjects
 * @route GET /api/subjects
 * @access Private
 */
exports.getMySubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};
