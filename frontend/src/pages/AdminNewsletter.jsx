import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch subscribers
        const subsRes = await fetch("https://smart-college-campaign.onrender.com/api/newsletter/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subsData = await subsRes.json();
        setSubscribers(subsData);

        // Fetch stats
        const statsRes = await fetch("https://smart-college-campaign.onrender.com/api/newsletter/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("https://smart-college-campaign.onrender.com/api/newsletter/export/csv", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newsletter-subscribers.csv";
      a.click();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this subscriber?")) return;

    try {
      const res = await fetch(`https://smart-college-campaign.onrender.com/api/newsletter/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSubscribers(subscribers.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-blue-400 hover:text-blue-300 mb-4 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            📬 Newsletter Subscribers
          </h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 text-white shadow-lg">
              <p className="text-sm text-blue-100">Total Subscribers</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-white shadow-lg">
              <p className="text-sm text-green-100">Confirmed</p>
              <p className="text-3xl font-bold">{stats.confirmed}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4 text-white shadow-lg">
              <p className="text-sm text-yellow-100">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white shadow-lg">
              <p className="text-sm text-purple-100">Confirmation Rate</p>
              <p className="text-3xl font-bold">{stats.confirmationRate}%</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg"
          >
            ⬇ Export CSV
          </button>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Joined</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-800">{sub.email}</td>
                    <td className="p-4 text-center">
                      {sub.confirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          ✅ Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-600 text-xs">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Integrate Nodemailer or SendGrid to automatically send confirmation emails. Update the `/subscribe` endpoint to send real emails instead of console logs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
