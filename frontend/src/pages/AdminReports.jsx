import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminReports = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              📊 System Reports
            </h1>
            <p className="text-gray-600 mt-1">Analytics and insights about your platform</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading reports...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <p className="text-blue-100 text-sm mb-1">Total Users</p>
                <h3 className="text-3xl font-bold">{stats?.totalUsers || 0}</h3>
                <p className="text-xs text-blue-100 mt-2">All registered accounts</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <p className="text-green-100 text-sm mb-1">Total Subjects</p>
                <h3 className="text-3xl font-bold">{stats?.totalSubjects || 0}</h3>
                <p className="text-xs text-green-100 mt-2">Active courses</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <p className="text-purple-100 text-sm mb-1">Total Notices</p>
                <h3 className="text-3xl font-bold">{stats?.totalNotices || 0}</h3>
                <p className="text-xs text-purple-100 mt-2">Posted announcements</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <p className="text-orange-100 text-sm mb-1">Avg Attendance</p>
                <h3 className="text-3xl font-bold">{stats?.avgAttendance || 0}%</h3>
                <p className="text-xs text-orange-100 mt-2">Overall attendance</p>
              </div>
            </div>

            {/* Detailed Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Users by Role */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👥 Users by Role
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Students</span>
                    <span className="font-bold text-blue-600">
                      {stats?.usersByRole?.student || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Teachers</span>
                    <span className="font-bold text-green-600">
                      {stats?.usersByRole?.teacher || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-700">Admins</span>
                    <span className="font-bold text-purple-600">
                      {stats?.usersByRole?.admin || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📈 System Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Notes Created</span>
                    <span className="font-bold text-gray-800">{stats?.totalNotes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Assignments</span>
                    <span className="font-bold text-gray-800">{stats?.totalAssignments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Exams Scheduled</span>
                    <span className="font-bold text-gray-800">{stats?.totalExams || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Active Sessions</span>
                    <span className="font-bold text-green-600">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export & Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                📥 Export Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm transition">
                  📄 Export PDF
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm transition">
                  📊 Export Excel
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm transition">
                  📧 Email Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
