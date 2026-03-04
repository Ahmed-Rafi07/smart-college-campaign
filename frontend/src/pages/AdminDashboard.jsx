import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import NoticeManagement from "../components/NoticeManagement";
import AttendanceProofViewer from "../components/AttendanceProofViewer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectForProof, setSelectedSubjectForProof] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user || user.role !== "admin") {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/admin/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Not authorized");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError("Access denied or failed to load admin stats");
        console.error("Admin stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Fetch chart data
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/charts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch charts");

        const data = await res.json();

        const formatted = data.labels.map((label, i) => ({
          date: label,
          users: data.userCounts[i],
          attendance: data.attendanceTrend[i],
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Chart fetch error:", err);
      }
    };

    fetchCharts();
  }, []);

  // Fetch subjects for attendance proof viewer
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (err) {
        console.error("Fetch subjects error:", err);
      }
    };

    fetchSubjects();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const blockUser = async (id, blocked) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blocked }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      await fetchUsers();
      alert(blocked ? "User blocked successfully" : "User unblocked successfully");
    } catch (err) {
      console.error("Block user error:", err);
      alert("Failed to update user");
    }
  };

  const forceLogout = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/logout`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to logout user");

      alert("User logged out from all devices");
    } catch (err) {
      console.error("Force logout error:", err);
      alert("Failed to logout user");
    }
  };

  const resetAttendance = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/attendance`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to reset attendance");

      alert("Attendance reset successfully");
    } catch (err) {
      console.error("Reset attendance error:", err);
      alert("Failed to reset attendance");
    }
  };

  const sendBroadcast = async () => {
    try {
      if (!notice.trim()) {
        alert("Please enter a notice message");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: notice }),
      });

      if (!res.ok) throw new Error("Failed to send broadcast");

      setNotice("");
      alert("Notice sent to all users");
    } catch (err) {
      console.error("Broadcast error:", err);
      alert("Failed to send broadcast");
    }
  };

  const exportPDF = async () => {
    try {
      const element = document.getElementById("admin-report");
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("admin-report.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">{error || "Failed to load data"}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                ADMIN
              </span>
            </div>
            <p className="text-sm text-gray-500">System Overview & Management</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
            <button
              onClick={() => navigate("/")}
              className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition text-xs sm:text-sm font-medium"
            >
              🏠 Home
            </button>
            <button
              onClick={exportPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm font-medium"
            >
              📥 Export Report
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-xs sm:text-sm font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="admin-report" className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            icon="👥"
            color="blue"
          />
          <StatCard 
            title="Total Students" 
            value={stats?.totalStudents || 0} 
            icon="🎓"
            color="green"
          />
          <StatCard 
            title="Total Admins" 
            value={stats?.totalAdmins || 0} 
            icon="🛡️"
            color="purple"
          />
          <StatCard 
            title="Total Teachers" 
            value={stats?.totalTeachers || stats?.totalFaculty || 0} 
            icon="👨‍🏫"
            color="orange"
          />
        </div>

        {/* Analytics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Active Users (24h)" 
            value={stats?.activeUsersCount || 0} 
            icon="🟢"
            color="green"
          />
          <StatCard 
            title="Total Classes" 
            value={stats?.totalClasses || 0} 
            icon="📚"
            color="blue"
          />
          <StatCard 
            title="Avg Attendance" 
            value={`${stats?.avgAttendance || 0}%`} 
            icon="📊"
            color="purple"
          />
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-8 mb-8">
            {/* User Growth */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ minHeight: 340 }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 User Growth (7 days)</h2>
              <div style={{ width: '100%', height: 256 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Trend */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ minHeight: 340 }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Attendance Trend (7 days)</h2>
              <div style={{ width: '100%', height: 256 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#16a34a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Recent Logins */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🕒 Recent Logins</h2>

          {!stats.recentLogins || stats.recentLogins.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent logins</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.recentLogins.map((log) => (
                <li
                  key={log._id}
                  className="border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {log.user?.role === "admin" ? "🛡️" : log.user?.role === "teacher" ? "👨‍🏫" : "👤"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {log.user?.username || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.user?.email} • {log.user?.role}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Broadcast Notice */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📢 Broadcast Notice</h2>
          <div className="flex gap-2">
            <input
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="Enter notice message..."
              className="border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendBroadcast}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Send
            </button>
          </div>
        </div>

        {/* Notice Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <NoticeManagement />
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">👥 User Management</h2>

          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 border border-gray-200 text-left">Name</th>
                    <th className="p-3 border border-gray-200 text-left">Email</th>
                    <th className="p-3 border border-gray-200 text-left">Role</th>
                    <th className="p-3 border border-gray-200 text-left">Status</th>
                    <th className="p-3 border border-gray-200 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-200">{u.username}</td>
                      <td className="p-3 border border-gray-200">{u.email}</td>
                      <td className="p-3 border border-gray-200">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200">
                        {u.blocked ? (
                          <span className="text-red-600 font-medium">🚫 Blocked</span>
                        ) : (
                          <span className="text-green-600 font-medium">✅ Active</span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-200 space-x-2">
                        <button
                          onClick={() => blockUser(u._id, !u.blocked)}
                          className={`px-3 py-1 text-white rounded text-xs font-medium transition ${
                            u.blocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          {u.blocked ? "Unblock" : "Block"}
                        </button>

                        <button
                          onClick={() => forceLogout(u._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition"
                        >
                          Logout
                        </button>

                        <button
                          onClick={() => resetAttendance(u._id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition"
                        >
                          Reset Att.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance Proof Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📸 Attendance Proof Verification</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject to View Proofs:
            </label>
            <select
              value={selectedSubjectForProof}
              onChange={(e) => setSelectedSubjectForProof(e.target.value)}
              className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Choose a subject --</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSubjectForProof ? (
            <AttendanceProofViewer
              subjectId={selectedSubjectForProof}
              subjectName={
                subjects.find((s) => s._id === selectedSubjectForProof)?.name || ""
              }
              token={localStorage.getItem("token")}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600">Select a subject to view attendance proofs</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <ActionButton 
              icon="👥" 
              title="Manage Users" 
              description="View and manage all users"
              onClick={() => navigate("/admin/users")}
            />
            <ActionButton 
              icon="📊" 
              title="View Reports" 
              description="Generate system reports"
              onClick={() => navigate("/admin/reports")}
            />
            <ActionButton 
              icon="⚙️" 
              title="Settings" 
              description="System configuration"
              onClick={() => navigate("/admin/settings")}
            />
            <ActionButton 
              icon="📬" 
              title="Newsletter" 
              description="Manage subscribers"
              onClick={() => navigate("/admin/newsletter")}
            />
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">👋 Welcome, Administrator!</h3>
          <p className="text-indigo-100">
            You have full access to system management tools. Use the dashboard to monitor user activity, 
            manage accounts, and configure system settings.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className={`text-2xl bg-gradient-to-br ${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      <div className="mt-2 text-xs text-gray-400">Updated just now</div>
    </div>
  );
};

const ActionButton = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">{icon}</div>
    <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-xs text-gray-500">{description}</p>
  </button>
);

export default AdminDashboard;
