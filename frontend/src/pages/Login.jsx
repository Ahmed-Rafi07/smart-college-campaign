import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / 20).toFixed(2);
    const rotateY = ((centerX - x) / 20).toFixed(2);

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTransform = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // 🔐 BACKEND LOGIN (JWT)
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 || res.status === 401) {
          throw new Error(data.message || "Invalid email or password");
        }
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // ✅ Save JWT + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      const normalizedRole = String(data?.user?.role || "")
        .trim()
        .toLowerCase();

      // 🔀 Redirect based on role
      if (normalizedRole === "admin") {
        navigate("/admin");
      } else if (normalizedRole === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a]">
      <ParticlesBackground />

      {/* Animated Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 animate-gradient opacity-90"></div>

      {/* Glow Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-30 top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px] opacity-30 bottom-[-80px] right-[-80px] animate-pulse"></div>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]"></div>

      {/* Premium Card Glow */}
      <div className="absolute w-[480px] h-[480px] bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="flex items-center justify-center min-h-screen perspective-[1200px]">
        <form
          ref={cardRef}
          onSubmit={handleLogin}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTransform}
          className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] w-[460px] p-10 transition-transform duration-200"
        >
          {/* HEADER */}
          <h2 className="text-3xl font-bold text-center text-white mb-1">
            Welcome Back 👋
          </h2>
          <p className="text-center text-white/70 mb-8 text-sm">
            Login to Smart College Companion
          </p>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/20 text-red-100 border border-red-300/40 text-sm p-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* USERNAME (UI ONLY) */}
          <label className="text-sm text-white/80">Username</label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-3 text-white/70">👤</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              autoComplete="username"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            />
          </div>

          {/* EMAIL */}
          <label className="text-sm text-white/80">Email</label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-3 text-white/70">📧</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            />
          </div>

          {/* PASSWORD */}
          <label className="text-sm text-white/80">Password</label>
          <div className="relative mb-6">
            <span className="absolute left-3 top-3 text-white/70">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white/70 hover:text-white"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] shadow-lg hover:shadow-purple-500/40"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FOOTER */}
          <p className="text-sm text-center mt-6 text-white/80">
            New here?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-300 cursor-pointer hover:underline"
            >
              Create an account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
