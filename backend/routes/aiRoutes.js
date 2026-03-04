const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const AIChat = require("../models/AIChat");
const jwt = require("jsonwebtoken");

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ GROQ API key missing");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware to extract userId from JWT
const extractUserId = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Save & Load Chat History with Subject
router.post("/chat", extractUserId, async (req, res) => {
  try {
    const { message, subject = "general" } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Find or create chat for this user and subject
    let chat = await AIChat.findOne({ userId, subject });
    if (!chat) {
      chat = await AIChat.create({ userId, subject, messages: [] });
    }

    // Add user message to chat
    chat.messages.push({ role: "user", content: message });

    try {
      // Get AI response with full chat context
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: `You are a helpful AI study assistant for students. Topic: ${subject}. Provide accurate, concise, and educational responses.` 
          },
          ...chat.messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const reply = completion.choices[0].message.content;
      chat.messages.push({ role: "assistant", content: reply });
      await chat.save();

      res.json({ reply, messages: chat.messages });
    } catch (aiErr) {
      // Offline Fallback
      console.error("AI Error:", aiErr.message);
      const offlineReply = "You're offline or the AI service is unavailable. Your message has been saved. Try again when your connection is restored.";
      chat.messages.push({ role: "assistant", content: offlineReply });
      await chat.save();
      
      res.json({ reply: offlineReply, messages: chat.messages, offline: true });
    }
  } catch (err) {
    console.error("Chat Error:", err.message);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// Get Chat History by Subject
router.get("/history/:subject", extractUserId, async (req, res) => {
  try {
    const chat = await AIChat.findOne({ userId: req.userId, subject: req.params.subject });
    res.json(chat?.messages || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
});

// Get All Chats for User
router.get("/chats", extractUserId, async (req, res) => {
  try {
    const chats = await AIChat.find({ userId: req.userId }).select("subject title updatedAt");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load chats" });
  }
});

// Delete Chat
router.delete("/chat/:chatId", extractUserId, async (req, res) => {
  try {
    await AIChat.findByIdAndDelete(req.params.chatId);
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

// AI Summarize Notes
router.post("/summarize", extractUserId, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      const fallbackSummary = text.slice(0, 200) + (text.length > 200 ? "..." : "");
      return res.json({ 
        summary: fallbackSummary,
        offline: true,
        message: "AI is offline. Showing preview instead."
      });
    }

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "Summarize the following notes in simple, clear bullet points for a student. Keep it concise and easy to understand." 
          },
          { 
            role: "user", 
            content: text 
          }
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const summary = completion.choices[0].message.content;
      res.json({ summary });
    } catch (aiErr) {
      // Offline fallback
      console.error("AI Summarize Error:", aiErr.message);
      const fallbackSummary = text.slice(0, 200) + (text.length > 200 ? "..." : "");
      res.json({ 
        summary: fallbackSummary,
        offline: true,
        message: "AI service unavailable. Showing preview instead."
      });
    }
  } catch (err) {
    console.error("Summarize Error:", err.message);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// AI Study Planner
router.post("/study-plan", extractUserId, async (req, res) => {
  try {
    const { days, subjects, customPrompt } = req.body;

    if (!days || !subjects || subjects.length === 0) {
      return res.status(400).json({ error: "Days and subjects are required" });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      const fallbackPlan = `Study Plan (${days} days):\n${subjects.map((s, i) => `Day ${i + 1}: Study ${s} (2-3 hours)\nDay ${i + 2}: Practice ${s} problems\n`).join('')}`;
      return res.json({ 
        plan: fallbackPlan,
        offline: true,
        message: "AI is offline. Showing basic plan."
      });
    }

    try {
      const userPrompt = customPrompt 
        ? `${customPrompt} Create a ${days}-day study plan for: ${subjects.join(", ")}`
        : `Create a ${days}-day study plan for these subjects: ${subjects.join(", ")}. Format: Day 1: [topic] (2 hours), Day 2: [topic] (2 hours), etc.`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "You are an expert study planner. Create a realistic, day-by-day study plan that balances all subjects and includes breaks. Be concise and actionable." 
          },
          { 
            role: "user", 
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const plan = completion.choices[0].message.content;
      res.json({ plan });
    } catch (aiErr) {
      // Offline fallback
      console.error("AI Study Plan Error:", aiErr.message);
      const fallbackPlan = `Study Plan (${days} days):\n${subjects.map((s, i) => `Day ${i + 1}: Study ${s} (2-3 hours)\nDay ${i + 2}: Review ${s} concepts\n`).join('')}`;
      res.json({ 
        plan: fallbackPlan,
        offline: true,
        message: "AI service unavailable. Showing basic plan."
      });
    }
  } catch (err) {
    console.error("Study Planner Error:", err.message);
    res.status(500).json({ error: "Failed to generate study plan" });
  }
});

module.exports = router;
