import { motion } from "framer-motion";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // success | error | loading

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      setStatus("loading");

      // 🔁 Call backend API
      const res = await fetch("https://smart-college-campaign.onrender.com/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Subscription failed");
      
      const data = await res.json();

      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error("Subscribe error:", err);
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubscribe();
  };

  return (
    <div>
      <h4 className="text-white font-semibold mb-3">Newsletter</h4>
      <p className="text-sm text-gray-400 mb-3">Get product updates and tips.</p>
      
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 rounded bg-white/10 text-white text-sm outline-none border border-white/10 focus:border-blue-500 transition placeholder-gray-500"
        />
        <button
          onClick={handleSubscribe}
          disabled={status === "loading"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>

      {status === "success" && (
        <p className="text-green-400 text-xs mt-2 animate-pulse">
          ✅ Subscribed successfully!
        </p>
      )}

      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">
          ❌ Please enter a valid email.
        </p>
      )}
    </div>
  );
};

const Footer = () => {
  return (
    <motion.footer
      className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-gray-300"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-x-0 -top-20 h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              SC
            </div>
            <span className="text-white font-semibold text-lg">
              Smart College Companion
            </span>
          </div>
          <p className="text-sm text-gray-400 max-w-md">
            Your all-in-one platform to manage academics, attendance, exams, and
            get AI-powered academic assistance.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://www.instagram.com/rafi_ahmxd/"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-500 hover:scale-110 transition-all duration-300 flex items-center justify-center"
              title="Instagram"
            >
              📸
            </a>
            <a
              href="https://www.linkedin.com/in/ahmed-rafi07/"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600 hover:scale-110 transition-all duration-300 flex items-center justify-center"
              title="LinkedIn"
            >
              💼
            </a>
            <a
              href="https://github.com/Ahmed-Rafi07"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-gray-700 hover:scale-110 transition-all duration-300 flex items-center justify-center"
              title="GitHub"
            >
              🧑‍💻
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition">Home</a></li>
            <li><a href="/notes" className="hover:text-white transition">Notes</a></li>
            <li><a href="/student" className="hover:text-white transition">Dashboard</a></li>
            <li><a href="/login" className="hover:text-white transition">Login</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <Newsletter />
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <span>© 2026 Smart College Companion. All rights reserved.</span>
          <span>
            Built with <span className="text-red-500">❤️</span> by Rafi
          </span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
