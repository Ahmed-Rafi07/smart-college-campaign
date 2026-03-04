import { useState, useEffect } from "react";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const priorityColors = {
    urgent: "bg-red-100 border-red-400 text-red-800",
    important: "bg-orange-100 border-orange-400 text-orange-800",
    normal: "bg-blue-50 border-blue-300 text-blue-800",
  };

  const priorityIcons = {
    urgent: "🚨",
    important: "⚠️",
    normal: "📢",
  };

  const typeIcons = {
    exam: "📝",
    event: "🎓",
    deadline: "⏰",
    holiday: "🏖️",
    general: "📢",
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, filterType, searchTerm]);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotices(data);
      setFilteredNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotices = () => {
    let filtered = [...notices];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((notice) => notice.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotices(filtered);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return new Date(date).toLocaleDateString();
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">🔔 College Notices</h1>
        <p className="text-blue-100 text-sm">
          Stay updated with all important announcements and alerts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {["all", "exam", "event", "deadline", "holiday", "general"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                    filterType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "all" ? "All" : typeIcons[type] + " " + type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Notices Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <b>{filteredNotices.length}</b> notice(s)
        </p>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">No notices found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your filters"
              : "Check back later for updates"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice._id}
              className={`rounded-xl p-5 border-l-4 shadow-md hover:shadow-lg transition ${
                priorityColors[notice.priority]
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl flex-shrink-0">
                  {priorityIcons[notice.priority]}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg leading-tight">
                      {notice.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getTimeAgo(notice.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="px-2.5 py-1 bg-white rounded-full font-medium shadow-sm">
                      {typeIcons[notice.type]} {notice.type}
                    </span>
                    <span className="px-2.5 py-1 bg-white rounded-full font-medium shadow-sm capitalize">
                      {notice.priority}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mb-3 pl-11">
                {notice.message}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-600 pl-11">
                <span>
                  📅 Posted on {new Date(notice.createdAt).toLocaleDateString()}
                </span>
                {notice.expiresAt && (
                  <span className="text-red-600 font-medium">
                    ⏳ Valid until {new Date(notice.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Stats */}
      {filteredNotices.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span>💡</span>
            <span>
              <b>Tip:</b> Check notices regularly to stay updated on important announcements and deadlines.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
