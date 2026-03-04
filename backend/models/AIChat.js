const mongoose = require("mongoose");

const aiChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, default: "general" },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  title: { type: String, default: "New Chat" }
}, { timestamps: true });

module.exports = mongoose.model("AIChat", aiChatSchema);
