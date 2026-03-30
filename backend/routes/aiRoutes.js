const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const AIChat = require("../models/AIChat");
const jwt = require("jsonwebtoken");

const groqKey = (process.env.GROQ_API_KEY || "").trim();
const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
const geminiKey = (process.env.GEMINI_API_KEY || "").trim();

const isGroqKey = groqKey.startsWith("gsk_");
const isOpenAIKey = openaiKey.startsWith("sk-");
const isGeminiKey = geminiKey.startsWith("AIza");

const configuredApiKey = isGroqKey ? groqKey : isOpenAIKey ? openaiKey : isGeminiKey ? geminiKey : "";

if (!configuredApiKey) {
  console.warn("⚠️ No valid AI API key found. Set GROQ_API_KEY (gsk_...), OPENAI_API_KEY (sk-...), or GEMINI_API_KEY (AIza...) in .env");
}

const groq = isGroqKey ? new Groq({ apiKey: groqKey }) : null;
const openai = isOpenAIKey ? new OpenAI({ apiKey: openaiKey }) : null;
const gemini = isGeminiKey ? new GoogleGenerativeAI(geminiKey) : null;

if (gemini) console.log("✅ AI provider: Google Gemini");
else if (groq) console.log("✅ AI provider: Groq");
else if (openai) console.log("✅ AI provider: OpenAI");

const isAIEnabled = () => Boolean(groq || openai || gemini);

const getActiveProvider = () => (groq ? "groq" : openai ? "openai" : gemini ? "gemini" : "none");

const parseAIError = (error) => {
  const status = error?.status || error?.response?.status;
  const rawMessage =
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    "AI provider request failed";
  const text = String(rawMessage).toLowerCase();

  if (status === 401 || text.includes("invalid api key") || text.includes("authentication")) {
    return {
      reason: "auth",
      message: "AI authentication failed. Check your API key in backend .env.",
    };
  }

  if (status === 429 || text.includes("quota") || text.includes("rate limit") || text.includes("billing") || text.includes("insufficient")) {
    return {
      reason: "quota",
      message: "AI quota/billing limit reached. Check usage and billing for your provider account.",
    };
  }

  if (status === 400 || text.includes("model") || text.includes("not found")) {
    return {
      reason: "model",
      message: "AI model/config is invalid. Check OPENAI_MODEL, GROQ_MODEL, or GEMINI_MODEL in .env.",
    };
  }

  return {
    reason: "service",
    message: "AI service is currently unavailable. Please try again shortly.",
  };
};

const createChatCompletion = async ({ messages, temperature = 0.7, max_tokens = 512 }) => {
  if (groq) {
    return groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
      temperature,
      max_tokens,
    });
  }

  if (openai) {
    return openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature,
      max_tokens,
    });
  }

  if (gemini) {
    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMsgs = messages.filter((m) => m.role !== "system");
    const lastMsg = conversationMsgs[conversationMsgs.length - 1];
    const historyMsgs = conversationMsgs.slice(0, -1);

    const model = gemini.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      systemInstruction: systemMsg?.content,
    });

    const history = historyMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMsg.content);
    const text = result.response.text();

    // Return in OpenAI-compatible format
    return { choices: [{ message: { content: text } }] };
  }

  throw new Error("AI provider is not configured");
};

router.get("/health", (req, res) => {
  const provider = getActiveProvider();
  const model = provider === "groq"
    ? process.env.GROQ_MODEL || "llama-3.1-8b-instant"
    : provider === "openai"
      ? process.env.OPENAI_MODEL || "gpt-4o-mini"
      : provider === "gemini"
        ? process.env.GEMINI_MODEL || "gemini-1.5-flash"
        : null;

  return res.json({
    ok: isAIEnabled(),
    provider,
    model,
    keyConfigured: Boolean(configuredApiKey),
  });
});

// Middleware to extract userId from JWT
const extractUserId = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server auth configuration missing" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id || decoded?.userId || decoded?._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.userId = userId;
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

    console.log("BODY:", req.body);
    console.log("USER:", req.userId);

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const normalizedSubject = String(subject || "general").trim() || "general";
    const cleanedMessage = message.trim();

    // Find or create chat for this user and subject
    let chat = await AIChat.findOne({ userId, subject: normalizedSubject });
    if (!chat) {
      chat = await AIChat.create({ userId, subject: normalizedSubject, messages: [] });
    }

    // Add user message to chat
    chat.messages.push({ role: "user", content: cleanedMessage });

    if (!isAIEnabled()) {
      const offlineReply = "You're offline or the AI service is unavailable. Your message has been saved. Try again when your connection is restored.";
      chat.messages.push({ role: "assistant", content: offlineReply });
      await chat.save();
      return res.json({ reply: offlineReply, messages: chat.messages, offline: true });
    }

    try {
      // Get AI response with full chat context
      const completion = await createChatCompletion({
        messages: [
          { 
            role: "system", 
            content: `You are a helpful AI study assistant for students. Topic: ${normalizedSubject}. Provide accurate, concise, and educational responses.` 
          },
          ...chat.messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        ],
      });

      const reply = completion?.choices?.[0]?.message?.content || "AI could not generate a response.";
      chat.messages.push({ role: "assistant", content: reply });
      await chat.save();

      res.json({ reply, messages: chat.messages });
    } catch (aiErr) {
      // Offline Fallback
      console.error("AI Error status:", aiErr?.status || aiErr?.response?.status);
      console.error("AI Error message:", aiErr?.message);
      console.error("AI Error detail:", JSON.stringify(aiErr?.error || aiErr?.response?.data || {}, null, 2));
      const details = parseAIError(aiErr);
      const offlineReply = `AI unavailable: ${details.message}`;
      chat.messages.push({ role: "assistant", content: offlineReply });
      await chat.save();
      
      res.json({
        reply: offlineReply,
        messages: chat.messages,
        offline: true,
        reason: details.reason,
        message: details.message,
      });
    }
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// Get Chat History by Subject
router.get("/history/:subject", extractUserId, async (req, res) => {
  try {
    const subject = String(req.params.subject || "general").trim() || "general";
    const chat = await AIChat.findOne({ userId: req.userId, subject });
    res.json(chat?.messages || []);
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// Clear Chat History by Subject
router.delete("/history/:subject", extractUserId, async (req, res) => {
  try {
    const subject = String(req.params.subject || "general").trim() || "general";
    const deleted = await AIChat.findOneAndDelete({ userId: req.userId, subject });
    res.json({ ok: true, cleared: Boolean(deleted), subject });
  } catch (err) {
    console.error("Clear History Error:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
});

// Get All Chats for User
router.get("/chats", extractUserId, async (req, res) => {
  try {
    const chats = await AIChat.find({ userId: req.userId }).select("subject title updatedAt");
    res.json(chats);
  } catch (err) {
    console.error("Chats Error:", err);
    res.status(500).json({ error: "Failed to load chats" });
  }
});

// Delete Chat
router.delete("/chat/:chatId", extractUserId, async (req, res) => {
  try {
    await AIChat.findOneAndDelete({ _id: req.params.chatId, userId: req.userId });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    console.error("Delete Chat Error:", err);
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
    if (!isAIEnabled()) {
      const fallbackSummary = text.slice(0, 200) + (text.length > 200 ? "..." : "");
      return res.json({ 
        summary: fallbackSummary,
        offline: true,
        message: "AI is offline. Showing preview instead."
      });
    }

    try {
      const completion = await createChatCompletion({
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
      });

      const summary = completion?.choices?.[0]?.message?.content || "Summary unavailable.";
      res.json({ summary });
    } catch (aiErr) {
      // Offline fallback
      console.error("AI Summarize Error:", aiErr.message);
      const details = parseAIError(aiErr);
      const fallbackSummary = text.slice(0, 200) + (text.length > 200 ? "..." : "");
      res.json({ 
        summary: fallbackSummary,
        offline: true,
        reason: details.reason,
        message: details.message
      });
    }
  } catch (err) {
    console.error("Summarize Error:", err);
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
    if (!isAIEnabled()) {
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

      const completion = await createChatCompletion({
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
        max_tokens: 1024,
      });

      const plan = completion?.choices?.[0]?.message?.content || "Plan unavailable.";
      res.json({ plan });
    } catch (aiErr) {
      // Offline fallback
      console.error("AI Study Plan Error:", aiErr.message);
      const details = parseAIError(aiErr);
      const fallbackPlan = `Study Plan (${days} days):\n${subjects.map((s, i) => `Day ${i + 1}: Study ${s} (2-3 hours)\nDay ${i + 2}: Review ${s} concepts\n`).join('')}`;
      res.json({ 
        plan: fallbackPlan,
        offline: true,
        reason: details.reason,
        message: details.message
      });
    }
  } catch (err) {
    console.error("Study Planner Error:", err);
    res.status(500).json({ error: "Failed to generate study plan" });
  }
});

module.exports = router;
