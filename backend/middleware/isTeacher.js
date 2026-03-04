module.exports = (req, res, next) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  if (role !== "teacher" && role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
