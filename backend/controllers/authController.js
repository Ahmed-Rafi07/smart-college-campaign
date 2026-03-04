const User = require("../models/user");
const LoginLog = require("../models/LoginLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const normalizeRole = (rawRole) => {
  const value = String(rawRole || "").trim().toLowerCase();
  if (!value) return null;

  if (value.includes(",")) {
    const parts = value.split(",").map((part) => part.trim());
    if (parts.includes("admin")) return "admin";
    if (parts.includes("teacher") || parts.includes("faculty")) return "teacher";
    if (parts.includes("student")) return "student";
  }

  if (value === "faculty") return "teacher";
  if (value === "student" || value === "teacher" || value === "admin") {
    return value;
  }

  return null;
};

// REGISTER
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role ? normalizeRole(role) : "student";

    if (!normalizedRole) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles: student, teacher, admin",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        name: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const normalizedRole = normalizeRole(user.role) || "student";

    if (user.role !== normalizedRole) {
      user.role = normalizedRole;
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: normalizedRole, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Log the login
    try {
      await LoginLog.create({
        user: user._id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (logErr) {
      console.error("Login log error:", logErr);
      // Don't fail login if logging fails
    }

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: normalizedRole,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
