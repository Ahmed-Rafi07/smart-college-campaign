import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";

const Home = ({ user }) => {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const footerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="relative z-10">
      <Helmet>
        <title>Smart College Companion</title>
        <meta
          name="description"
          content="AI-powered academic management platform for attendance, assignments, notices, and student productivity."
        />
      </Helmet>

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          
          {/* LOGO */}
          <BrandLogo
            size="sm"
            titleClassName="text-gray-800 dark:text-slate-100 font-semibold"
            subtitleClassName="text-xs text-slate-500 dark:text-slate-400"
          />

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold tracking-wide">
            <ThemeToggle />
            <span
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white cursor-pointer transition"
            >
              Home
            </span>

            <span
              onClick={() =>
                featuresRef.current.scrollIntoView({ behavior: "smooth" })
              }
              className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white cursor-pointer transition"
            >
              Features
            </span>

            <span
              onClick={() =>
                footerRef.current.scrollIntoView({ behavior: "smooth" })
              }
              className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white cursor-pointer transition"
            >
              Contact
            </span>

            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-sm text-sm font-medium"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {user?.role === "admin" && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      {user.role.toUpperCase()}
                    </span>
                    <button
                      onClick={() => navigate("/admin")}
                      className="bg-purple-600 text-white px-4 py-1.5 rounded-full hover:bg-purple-700 transition shadow-sm text-sm font-medium"
                    >
                      🛡️ Admin
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate("/student")}
                  className="bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600 transition shadow-sm text-sm font-medium"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-slate-300 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t dark:border-slate-800">
            <div className="px-4 py-3 space-y-3">
              <div className="pt-1">
                <ThemeToggle />
              </div>
              <span
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
                className="block text-sm font-semibold tracking-wide text-gray-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
              >
                Home
              </span>
              <span
                onClick={() => {
                  featuresRef.current.scrollIntoView({ behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
                className="block text-sm font-semibold tracking-wide text-gray-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
              >
                Features
              </span>
              <span
                onClick={() => {
                  footerRef.current.scrollIntoView({ behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
                className="block text-sm font-semibold tracking-wide text-gray-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
              >
                Contact
              </span>
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition text-sm font-medium"
                >
                  Login
                </button>
              ) : (
                <div className="space-y-2">
                  {user?.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="w-full bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition text-sm font-medium"
                    >
                      🛡️ Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/student")}
                    className="w-full bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition text-sm font-medium"
                  >
                    Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section
        className="w-full min-h-[70vh] md:min-h-[62vh] flex items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)"
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-center w-full py-14 md:py-20">

          {/* Left Content */}
          <div className="relative text-center md:text-left">
            <div className="absolute w-[600px] h-[600px] bg-purple-500 blur-[180px] opacity-20 -z-10 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-1/2 -translate-y-1/2"></div>

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-white">
              One Platform.
              <br />
              <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Total Academic Control.
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto md:mx-0">
              Track attendance, manage assignments, organize notes, and get instant AI assistance — all from one beautifully designed smart platform.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-medium rounded-full shadow-lg hover:scale-105 transition duration-300"
                >
                  🚀 Enter Dashboard
                </button>
                <button
                  onClick={() => featuresRef.current.scrollIntoView({ behavior: "smooth" })}
                  className="border-2 border-white/80 text-white px-6 py-3 rounded-full hover:bg-white hover:text-blue-600 transition text-sm font-medium"
                >
                  Learn More
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/student")}
                className="mt-8 px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-medium rounded-full shadow-lg hover:scale-105 transition duration-300 mx-auto md:mx-0"
              >
                🚀 Enter Dashboard
              </button>
            )}

            <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-8 md:gap-10 text-white/80 text-sm">
              <div>
                <p className="text-3xl font-bold tracking-tight text-white">95%</p>
                <p>Attendance Tracking Accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-white">24/7</p>
                <p>AI Assistance</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-white">All-in-One</p>
                <p>Student Tools</p>
              </div>
            </div>
          </div>

          {/* Right Image Card */}
          <div className="hidden md:flex justify-end">
            <div
              className="w-[320px] h-[200px] lg:w-[380px] lg:h-[240px] rounded-2xl shadow-2xl bg-cover bg-center relative overflow-hidden transform hover:scale-105 transition duration-300"
              style={{ 
                backgroundImage: "url('/student.jpg'), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600')",
                backgroundSize: "cover"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  📚 Student studying
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Decorative blur */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl"></div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        ref={featuresRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-12 sm:mb-16">
          Why Smart College Companion?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <FeatureCard
            icon="📊"
            title="Timetable & Attendance"
            desc="Stay on track with classes and attendance in real time."
            route="/student"
            onClick={() => navigate("/student")}
          />
          <FeatureCard
            icon="🤖"
            title="AI Study Helper"
            desc="Instant help with concepts, coding, and exams."
            route="/student/ai-helper"
            onClick={() => navigate("/student/ai-helper")}
          />
          <FeatureCard
            icon="🔔"
            title="Notices & Events"
            desc="Never miss important college updates or deadlines."
            route="/student"
            onClick={() => navigate("/student")}
          />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <div ref={footerRef}>
        <Footer />
      </div>
      </div>
    </div>
  );
};

/* FEATURE CARD */
const FeatureCard = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="text-xl font-semibold tracking-tight mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-gray-600">{desc}</p>
    <div className="mt-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-sm font-medium">
      Learn more <span className="group-hover:translate-x-1 transition-transform">→</span>
    </div>
  </div>
);

export default Home;
