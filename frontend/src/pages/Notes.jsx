import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [offline, setOffline] = useState(!navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // ✅ Check authorization
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchNotes();
  }, [token, navigate]);

  // ✅ Offline mode detection
  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      fetchNotes(); // Sync when back online
      syncPendingNotes(); // Sync offline notes
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token]);

  /* ========================
     FETCH NOTES
  ======================== */
  const fetchNotes = async (search = "") => {
    try {
      setLoading(true);
      
      // If offline, load from cache immediately
      if (!navigator.onLine) {
        const cached = JSON.parse(localStorage.getItem("cachedNotes") || "[]");
        setNotes(cached);
        return;
      }

      const url = new URL("http://localhost:5000/api/notes");
      if (search) {
        url.searchParams.append("search", search);
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch notes");

      const data = await res.json();
      const notesArray = Array.isArray(data) ? data : [];
      setNotes(notesArray);
      
      // Cache the notes
      localStorage.setItem("cachedNotes", JSON.stringify(notesArray));
    } catch (err) {
      console.error("Fetch notes error:", err);
      // Try to load from cache on error
      const cached = JSON.parse(localStorage.getItem("cachedNotes") || "[]");
      if (cached.length > 0) {
        setNotes(cached);
        setError("Using cached notes (connection error)");
      } else {
        setError("Failed to load notes");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     SEARCH HANDLER
  ======================== */
  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes(searchTerm);
  };

  /* ========================
     SYNC PENDING NOTES (Offline → Online)
  ======================== */
  const syncPendingNotes = async () => {
    const pending = JSON.parse(localStorage.getItem("pendingNotes") || "[]");

    if (pending.length === 0) return;

    try {
      for (const note of pending) {
        await fetch("http://localhost:5000/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(note),
        });
      }

      // Clear pending after sync
      localStorage.removeItem("pendingNotes");
      console.log(`✅ ${pending.length} offline note(s) synced!`);
      setError(""); // Clear any error messages
      fetchNotes(); // Refresh the notes list
    } catch (err) {
      console.error("Sync error:", err);
      setError("Failed to sync some offline notes. They will sync when online.");
    }
  };

  /* ========================
     ADD NOTE
  ======================== */
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      setError("Title is required");
      return;
    }
    if (!noteContent.trim()) {
      setError("Content cannot be empty");
      return;
    }

    const noteData = { 
      title: noteTitle.trim(),
      content: noteContent.trim()
    };

    try {
      console.log("📝 Creating note with title:", noteTitle);

      // If offline, save to pending notes
      if (!navigator.onLine) {
        const pending = JSON.parse(localStorage.getItem("pendingNotes") || "[]");
        const tempId = `temp-${Date.now()}`;
        const offlineNote = { ...noteData, _id: tempId, createdAt: new Date() };
        
        localStorage.setItem("pendingNotes", JSON.stringify([...pending, noteData]));
        setNotes([offlineNote, ...notes]);
        setNoteTitle("");
        setNoteContent("");
        setError("");
        console.log("📴 Note saved offline. Will sync when online.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Failed to save note");
      }

      const savedNote = await res.json();
      console.log("📝 Note created successfully:", savedNote._id);
      setNotes([savedNote, ...notes]);
      setNoteTitle("");
      setNoteContent("");
      setError("");
    } catch (err) {
      console.error("❌ Add note error:", err.message);
      setError(err.message || "Failed to save note");
    }
  };

  /* ========================
     UPDATE NOTE
  ======================== */
  const handleUpdateNote = async (id) => {
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }
    if (!editText.trim()) {
      setError("Content cannot be empty");
      return;
    }

    try {
      console.log("📝 Updating note:", id);
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: editTitle.trim(),
          content: editText.trim() 
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");

      const updatedNote = await res.json();
      console.log("📝 Note updated successfully:", id);
      setNotes(
        notes.map((note) => (note._id === id ? updatedNote : note))
      );
      setEditingId(null);
      setEditTitle("");
      setEditText("");
      setError("");
    } catch (err) {
      console.error("❌ Update note error:", err.message);
      setError("Failed to update note");
    }
  };

  /* ========================
     DELETE NOTE
  ======================== */
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;

    try {
      console.log("📝 Deleting note:", id);
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setNotes(notes.filter((note) => note._id !== id));
      console.log("📝 Note deleted successfully:", id);
      setError("");
    } catch (err) {
      console.error("❌ Delete note error:", err.message);
      setError("Failed to delete note");
    }
  };

  /* ========================
     FORMAT DATE
  ======================== */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex transition-opacity duration-500 opacity-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white p-6 hidden md:block shadow-xl">
        <div className="mb-10 pb-4 border-b border-white/20">
          <BrandLogo
            titleClassName="text-white font-semibold"
            subtitleClassName="text-xs text-blue-200"
          />
        </div>

        {/* STUDENT MENU */}
        <nav className="space-y-1 text-sm">
          <SidebarItem
            icon="📊"
            label="Dashboard"
            active={false}
            onClick={() => navigate("/student")}
          />
          <SidebarItem
            icon="📚"
            label="Subjects"
            active={false}
            onClick={() => navigate("/student")}
          />
          <SidebarItem
            icon="✅"
            label="Attendance"
            active={false}
            onClick={() => navigate("/student")}
          />
          <SidebarItem
            icon="📝"
            label="Assignments"
            active={false}
            onClick={() => navigate("/student")}
          />
          <SidebarItem
            icon="📓"
            label="Notes"
            active={true}
            onClick={() => navigate("/notes")}
          />
          <SidebarItem
            icon="🤖"
            label="AI Helper"
            active={false}
            onClick={() => navigate("/student")}
          />
          <SidebarItem
            icon="🔔"
            label="Notices"
            active={false}
            onClick={() => navigate("/student")}
          />

          {/* Admin Link (Only for Admins) */}
          {user?.role === "admin" && (
            <>
              <div className="border-t border-white/20 my-4"></div>
              <SidebarItem
                icon="🛡️"
                label="Admin Panel"
                active={false}
                onClick={() => navigate("/admin")}
              />
            </>
          )}
        </nav>
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white p-6 z-50 md:hidden shadow-2xl">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/20">
              <BrandLogo
                titleClassName="text-white font-semibold"
                subtitleClassName="text-xs text-blue-200"
              />
              <button onClick={() => setMobileMenuOpen(false)} className="text-white text-xl">✕</button>
            </div>

            <nav className="space-y-1 text-sm">
              <SidebarItem
                icon="📊"
                label="Dashboard"
                active={false}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student");
                }}
              />
              <SidebarItem
                icon="📚"
                label="Subjects"
                active={false}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student");
                }}
              />
              <SidebarItem
                icon="✅"
                label="Attendance"
                active={false}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student");
                }}
              />
              <SidebarItem
                icon="📝"
                label="Assignments"
                active={false}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student");
                }}
              />
              <SidebarItem
                icon="📓"
                label="Notes"
                active={true}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/notes");
                }}
              />
              <SidebarItem
                icon="🤖"
                label="AI Helper"
                active={false}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student");
                }}
              />
              <SidebarItem
                icon="🔔"
                label="Notices"
                active={false}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student");
                }}
              />

              {user?.role === "admin" && (
                <>
                  <div className="border-t border-white/20 my-4"></div>
                  <SidebarItem
                    icon="🛡️"
                    label="Admin Panel"
                    active={false}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/admin");
                    }}
                  />
                </>
              )}
            </nav>
          </aside>
        </>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-auto">
        {/* TOP BAR */}
        <div className="bg-white border-b shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-2xl text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📓 My Notes</h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Keep track of your quick notes and ideas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm text-gray-600">
              👤 {user?.username || "Student"}
            </span>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* NOTES CONTENT */}
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          {/* OFFLINE INDICATOR */}
          {offline && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-center gap-2">
              <span>📴</span>
              <span className="font-medium">You are offline. Showing cached notes.</span>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* SEARCH BAR */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search notes by title or content..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition text-sm font-medium"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    fetchNotes("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* ADD NOTE FORM */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              ➕ Add New Note
            </h3>
            <form onSubmit={handleAddNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📌 Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Give your note a title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Note Content
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                {loading ? "Saving..." : "💾 Save Note"}
              </button>
            </form>
          </div>

          {/* NOTES LIST */}
          <div className="space-y-4">
            {loading && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">Loading notes...</p>
              </div>
            )}

            {!loading && notes.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
              </div>
            )}

            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition border border-gray-200"
              >
                {editingId === note._id ? (
                  // EDIT MODE
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 font-semibold text-sm"
                      placeholder="Note title..."
                    />
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical mb-4 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateNote(note._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {note.title}
                    </h2>
                    <p className="text-gray-800 whitespace-pre-wrap mb-3 text-sm">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      📅 {formatDate(note.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditingId(note._id);
                          setEditTitle(note.title);
                          setEditText(note.content);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

/* ========================
   SIDEBAR COMPONENT
======================== */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`px-4 py-3 rounded-lg cursor-pointer transition flex items-center gap-3 ${
      active ? "bg-white/20 font-semibold shadow-md" : "hover:bg-white/10"
    }`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    <span>{label}</span>
  </div>
);

export default Notes;
