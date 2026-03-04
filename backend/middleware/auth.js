const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account is blocked by admin" });
    }

    if (decoded.tokenVersion && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Session expired. Please login again." });
  }
};

module.exports = auth;
