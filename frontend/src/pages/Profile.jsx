import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("A");
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // ✅ Check authorization and fetch profile
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/users/profile/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const profileData = await res.json();
        setName(profileData.name || user.name || "");
        setAvatar(profileData.avatar || (user.name || "A")[0].toUpperCase());
        setTheme(profileData.theme || localStorage.getItem("theme") || "light");
      } catch (err) {
        console.error("Fetch profile error:", err);
        // Fallback to localStorage
        setName(user.name || "");
        setAvatar((user.name || "A")[0].toUpperCase());
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate, user._id]);

  const handleSaveChanges = async () => {
    try {
      setError("");
      const res = await fetch(`http://localhost:5000/api/users/profile/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatar, theme }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const updatedUser = await res.json();
      
      // Update localStorage
      localStorage.setItem("theme", theme);
      localStorage.setItem("user", JSON.stringify({
        ...user,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to save changes");
    }
  };

  const handleChangeAvatar = () => {
    const newAvatar = prompt("Enter avatar initial (1 character):", avatar);
    if (newAvatar && newAvatar.length === 1) {
      setAvatar(newAvatar.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👤 Profile & Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* SUCCESS MESSAGE */}
            {saved && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ Changes saved successfully!
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ {error}
              </div>
            )}

        {/* PROFILE SECTION */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>

          {/* AVATAR */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {avatar}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Profile Avatar</p>
              <button
                onClick={handleChangeAvatar}
                className="text-sm text-blue-600 hover:underline font-medium transition"
              >
                Change Avatar
              </button>
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={user.email || "student@scc.com"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={user.role || "student"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
              />
            </div>
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Preferences</h2>

          <div className="space-y-5">
            {/* THEME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    theme === "light"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="border-t pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Email Notifications</p>
                  <p className="text-sm text-gray-600">Get notified about exams & assignments</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
              </div>
            </div>

            {/* OFFLINE MODE */}
            <div className="border-t pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">📴 Offline Mode</p>
                  <p className="text-sm text-gray-600">Cache notes for offline access</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveChanges}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            💾 Save Changes
          </button>
          <button
            onClick={() => navigate("/student")}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 mt-8">
          <h3 className="text-lg font-bold text-red-700 mb-3">⚠️ Danger Zone</h3>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
            Logout
          </button>
        </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
