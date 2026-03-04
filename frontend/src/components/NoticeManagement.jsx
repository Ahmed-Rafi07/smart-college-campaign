import { useState, useEffect } from "react";

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "normal",
    targetAudience: "all",
    expiresAt: "",
  });

  const priorityColors = {
    urgent: "bg-red-100 text-red-800 border-red-300",
    important: "bg-orange-100 text-orange-800 border-orange-300",
    normal: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const priorityIcons = {
    urgent: "🚨",
    important: "⚠️",
    normal: "📢",
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notices?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = editingNotice
        ? `http://localhost:5000/api/notices/${editingNotice._id}`
        : "http://localhost:5000/api/notices";

      const method = editingNotice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchNotices();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving notice:", error);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      message: notice.message,
      type: notice.type,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      expiresAt: notice.expiresAt
        ? new Date(notice.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "general",
      priority: "normal",
      targetAudience: "all",
      expiresAt: "",
    });
    setEditingNotice(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📢 Notice Management
          </h2>
          <p className="text-gray-600 text-sm">
            Post announcements, alerts, and updates for students
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
        >
          {showForm ? "Cancel" : "+ Create Notice"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingNotice ? "Edit Notice" : "Create New Notice"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Exam Alert: DBMS Postponed"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Enter the full notice content..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="exam">Exam</option>
                  <option value="event">Event</option>
                  <option value="deadline">Deadline</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="students">Students Only</option>
                  <option value="teachers">Teachers Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for no expiry
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                {editingNotice ? "Update Notice" : "Create Notice"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          All Notices ({notices.length})
        </h3>

        {notices.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500">No notices posted yet</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className={`rounded-xl p-5 border-l-4 ${
                priorityColors[notice.priority]
              } shadow-sm hover:shadow-md transition`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">
                    {priorityIcons[notice.priority]}
                  </span>
                  <div>
                    <h4 className="font-semibold text-lg">{notice.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="px-2 py-0.5 bg-white rounded-full font-medium">
                        {notice.type}
                      </span>
                      <span className="px-2 py-0.5 bg-white rounded-full font-medium">
                        {notice.priority}
                      </span>
                      <span className="text-gray-600">
                        👥 {notice.targetAudience}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                {notice.message}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>
                  📅 Posted {new Date(notice.createdAt).toLocaleDateString()}
                </span>
                {notice.expiresAt && (
                  <span>
                    ⏳ Expires {new Date(notice.expiresAt).toLocaleDateString()}
                  </span>
                )}
                <span>
                  ✍️ By {notice.createdBy?.name || "Admin"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeManagement;
