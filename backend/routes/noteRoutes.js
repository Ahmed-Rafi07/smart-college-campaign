const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const auth = require("../middleware/auth");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Create note
router.post("/", auth, async (req, res) => {
  try {
    console.log("📝 Creating note for user:", req.user.id);
    console.log("📝 Request body:", JSON.stringify(req.body));
    
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }
    
    const note = await Note.create({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      uploadedBy: req.user.id,
      subject: req.body.subject || null,
      tags: req.body.tags || []
    });
    console.log("📝 Note created:", note._id);
    res.json(note);
  } catch (err) {
    console.error("📝 Create Note Error:", err.message);
    res.status(500).json({ error: "Failed to create note: " + err.message });
  }
});

// Get notes
router.get("/", auth, async (req, res) => {
  try {
    console.log("📝 Fetching notes for user:", req.user.id);
    const { search, tags } = req.query;
    
    // Build query
    const query = { uploadedBy: req.user.id };
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }
    
    // Add tags filter
    if (tags) {
      query.tags = { $in: tags.split(",") };
    }
    
    const notes = await Note.find(query).sort({ createdAt: -1 });
    console.log("📝 Found notes:", notes.length);
    res.json(notes);
  } catch (err) {
    console.error("Fetch Notes Error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete Note Error:", err.message);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Summarize Note (AI)
router.post("/:id/summarize", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    try {
      // Try AI summarization
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that creates concise summaries. Summarize in one sentence, maximum 100 characters." 
          },
          { 
            role: "user", 
            content: `Summarize this note: ${note.content}` 
          }
        ],
        temperature: 0.5,
        max_tokens: 100,
      });

      const summary = completion.choices[0].message.content;
      note.summary = summary;
      await note.save();

      res.json({ summary });
    } catch (aiErr) {
      // Offline fallback - simple truncation
      console.warn("AI Summary failed, using fallback:", aiErr.message);
      const fallbackSummary = note.content.slice(0, 100) + (note.content.length > 100 ? "..." : "");
      note.summary = fallbackSummary;
      await note.save();
      
      res.json({ summary: fallbackSummary, offline: true });
    }
  } catch (err) {
    console.error("Summary Error:", err.message);
    res.status(500).json({ error: "Summary failed" });
  }
});

// Update note
router.put("/:id", auth, async (req, res) => {
  try {
    console.log("📝 Updating note:", req.params.id);
    
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }
    
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title.trim(),
        content: req.body.content.trim(),
        subject: req.body.subject || null,
        tags: req.body.tags || []
      },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    console.log("📝 Note updated successfully:", req.params.id);
    res.json(note);
  } catch (err) {
    console.error("📝 Update Note Error:", err.message);
    res.status(500).json({ error: "Failed to update note: " + err.message });
  }
});

module.exports = router;
