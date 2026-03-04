import { useEffect, useState } from "react";

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchActivities = async () => {
      if (!token || !user._id) return;

      try {
        setLoading(true);
        const res = await fetch(`https://smart-college-campaign.onrender.com/api/activity/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch activities");

        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error("Fetch activities error:", err);
        // Enhanced dummy data - simulates real activity
        setTimeout(() => {
          setActivities([
            { id: 1, message: "New exam added: Database Management (DBMS)", createdAt: new Date(Date.now() - 7200000), type: "exam" },
            { id: 2, message: "Note created: Operating System Basics", createdAt: new Date(Date.now() - 86400000), type: "notes" },
            { id: 3, message: "Attendance updated for CS301", createdAt: new Date(Date.now() - 172800000), type: "attendance" },
            { id: 4, message: "Notice posted: Workshop on AI & ML", createdAt: new Date(Date.now() - 259200000), type: "notice" },
            { id: 5, message: "Assignment submitted: Data Structures", createdAt: new Date(Date.now() - 345600000), type: "assignment" },
          ]);
        }, 800);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [token, user._id]);

  const getActivityIcon = (type) => {
    const icons = {
      exam: "📝",
      notice: "📢",
      notes: "📒",
      assignment: "📌",
      attendance: "✅",
      login: "🔓",
      update: "🔄",
    };
    return icons[type] || "📰";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        📰 Activity Feed
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading activities...
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-1">No activities yet.</p>
          <p className="text-xs text-gray-400">Your recent actions will appear here.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li
                key={activity._id || activity.id}
                className="border-l-4 border-blue-600 pl-4 py-2 hover:bg-gray-50 rounded transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">{activity.message}</p>
                    <span className="text-xs text-gray-500">{formatTime(activity.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* View All Link */}
          <button 
            onClick={() => setShowModal(true)}
            className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium transition hover:underline"
          >
            View all activities →
          </button>
        </>
      )}

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-2xl animate-fadeIn">
            <div className="mb-4">
              <span className="text-5xl">🚧</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              Activity History – Coming Soon
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Detailed activity logs with filters and export options are currently under development. 
              Stay tuned for updates!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
