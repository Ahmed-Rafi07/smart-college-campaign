import { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function QuickNotes() {
  const [showEditor, setShowEditor] = useState(false);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const saveNote = async () => {
    if (!text.trim()) {
      setError("Please write something before saving!");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text,
          tags: tags.split(",").map((t) => t.trim()).filter((t) => t),
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");

      setText("");
      setTags("");
      setSummary("");
      fetchNotes();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const summarizeNote = async (id) => {
    await fetch(`http://localhost:5000/api/notes/${id}/summarize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotes();
  };

  const deleteNote = async (id) => {
    if (window.confirm("Delete this note?")) {
      await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    }
  };

  const summarizeWithAI = async () => {
    if (!text.trim()) return;
    
    setLoadingSummary(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setSummary(data.summary || "AI failed to summarize.");
    } catch (err) {
      console.error("Summarize error:", err);
      setSummary("Failed to summarize. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    let y = 10;

    notes.forEach((n, i) => {
      pdf.text(`${i + 1}. ${n.content}`, 10, y);
      y += 8;
      if (n.summary) {
        pdf.text(`Summary: ${n.summary}`, 10, y);
        y += 8;
      }
    });

    pdf.save("quick-notes.pdf");
  };

  const filtered = notes.filter(
    (n) =>
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.join(",").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="font-semibold text-lg">📘 Quick Notes</h2>

      {/* AI Summarizer Section */}
      <button
        onClick={() => setShowSummarizer(!showSummarizer)}
        className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700"
      >
        ✨ AI Summarize Notes
      </button>

      {showSummarizer && (
        <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50 space-y-3">
          <textarea
            className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={5}
            placeholder="Paste your notes here and let AI summarize them..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={summarizeWithAI}
            disabled={loadingSummary || !text.trim()}
            className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loadingSummary ? "🤖 Summarizing..." : "📄 Summarize with AI"}
          </button>

          {summary && (
            <div className="bg-white border-l-4 border-green-500 p-4 rounded">
              <h4 className="font-semibold text-green-700 mb-2">✨ AI Summary</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing buttons */}
      <button
        onClick={downloadPDF}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        📥 Download Notes (PDF)
      </button>

      <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
        📚 View Materials
      </button>

      {/* New Controls */}
      <button
        onClick={() => setShowEditor(!showEditor)}
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
      >
        ✍️ Add / View Notes
      </button>

      {showEditor && (
        <div className="border rounded p-3 bg-gray-50 space-y-2">
          <textarea
            className="w-full border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Write quick note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            className="w-full border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <button
            onClick={saveNote}
            disabled={saving || !text.trim()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "💾 Saving..." : "✅ Save Note"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
              ⚠️ {error}
            </div>
          )}

          <input
            className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            placeholder="🔍 Search notes or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="text-xs text-gray-500 mb-2">
            {filtered.length} note{filtered.length !== 1 ? "s" : ""} found
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No notes yet. Create one above! ✍️</p>
            ) : (
              filtered.map((n) => (
                <div key={n._id} className="border rounded p-3 bg-white hover:shadow-md transition flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm flex-1 break-words">{n.content}</p>
                    <button
                      onClick={() => deleteNote(n._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded text-lg flex-shrink-0"
                      title="Delete note"
                    >
                      ✕
                    </button>
                  </div>

                  {n.summary && (
                    <p className="text-xs text-green-700 bg-green-50 p-2 rounded font-medium">
                      🧠 <strong>Summary:</strong> {n.summary}
                    </p>
                  )}

                  <div className="flex gap-1 flex-wrap">
                    {n.tags && n.tags.length > 0 && n.tags.map((t, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => summarizeNote(n._id)}
                    className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded font-medium self-start"
                  >
                    🧠 Summarize
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
