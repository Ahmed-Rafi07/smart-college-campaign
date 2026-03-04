const mongoose = require("mongoose");
const crypto = require("crypto");

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    default: () => crypto.randomBytes(20).toString("hex"),
  },
}, { timestamps: true });

module.exports = mongoose.model("Newsletter", NewsletterSchema);
