const express = require("express");
const Newsletter = require("../models/Newsletter");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// Subscribe to newsletter
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // Find or create newsletter subscription
    const subscriber = await Newsletter.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, new: true }
    );

    // TODO: Send confirmation email with link:
    // const confirmLink = `http://localhost:5173/confirm/${subscriber.token}`;
    // Use Nodemailer, SendGrid, or similar to email the confirmation link

    res.json({
      message: "Check your email to confirm subscription",
      token: subscriber.token,
    });
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(500).json({ message: "Subscription failed", error: err.message });
  }
});

// Confirm email with token
router.get("/confirm/:token", async (req, res) => {
  try {
    const subscriber = await Newsletter.findOne({ token: req.params.token });

    if (!subscriber) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    subscriber.confirmed = true;
    await subscriber.save();

    // Redirect to success page
    res.redirect("http://localhost:5173/?newsletter=confirmed");
  } catch (err) {
    console.error("Confirm error:", err.message);
    res.status(500).json({ message: "Confirmation failed" });
  }
});

// Get all subscribers (Admin only)
router.get("/all", auth, admin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    console.error("Fetch subscribers error:", err.message);
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

// Export subscribers to CSV (Admin only)
router.get("/export/csv", auth, admin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ confirmed: true });

    if (subscribers.length === 0) {
      return res.status(400).json({ message: "No confirmed subscribers to export" });
    }

    // Create CSV manually
    const headers = "email,joinedDate\n";
    const rows = subscribers
      .map((sub) => `${sub.email},${new Date(sub.createdAt).toLocaleDateString()}`)
      .join("\n");
    const csv = headers + rows;

    res.header("Content-Type", "text/csv");
    res.attachment("newsletter-subscribers.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export error:", err.message);
    res.status(500).json({ message: "Export failed", error: err.message });
  }
});

// Get subscription stats (Admin only)
router.get("/stats", auth, admin, async (req, res) => {
  try {
    const total = await Newsletter.countDocuments();
    const confirmed = await Newsletter.countDocuments({ confirmed: true });
    const pending = total - confirmed;

    res.json({
      total,
      confirmed,
      pending,
      confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Delete subscriber (Admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.json({ message: "Subscriber removed" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ message: "Failed to delete subscriber" });
  }
});

module.exports = router;
