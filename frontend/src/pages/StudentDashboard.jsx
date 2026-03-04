import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AttendancePieChart from "../components/AttendancePieChart";
import AttendanceTimeline from "../components/AttendanceTimeline";
import AIHelper from "../components/AIHelper";
import AIStudyPlanner from "../components/AIStudyPlanner";
import ActivityFeed from "../components/ActivityFeed";
import DashboardLoader from "../components/DashboardLoader";
import BrandLogo from "../components/BrandLogo";
import Notices from "../components/Notices";
import AttendanceProofCapture from "../components/AttendanceProofCapture";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const getNextExam = (exams) => {
  const now = new Date();
  return exams
    .map((e) => ({ ...e, date: new Date(e.dateTime) }))
    .filter((e) => e.date > now)
    .sort((a, b) => a.date - b.date)[0];
};

const formatCountdown = (target) => {
  const diff = target - new Date();
  if (diff <= 0) return "Started";

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);

  return `${d}d ${h}h ${m}m`;
};

const generateStudyPlan = (examDate) => {
  const daysLeft = Math.ceil(
    (new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) return [];

  return Array.from({ length: daysLeft }).map((_, i) => ({
    day: `Day ${i + 1}`,
    task: `Study for ${Math.max(20, 60 - i * 5)} minutes`,
  }));
};

/* ========================
   API HELPERS
======================== */
const fetchSubjectsAPI = async (token) => {
  const res = await fetch("http://localhost:5000/api/subjects", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.json();
};
const fetchAssignmentsAPI = async (token) => {
  try {
    const res = await fetch("http://localhost:5000/api/assignments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text(); // prevents JSON crash
      console.error("Assignments fetch failed:", text);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Assignments fetch error:", err);
    return [];
  }
};

const fetchAttendanceSummaryAPI = async (token) => {
  const res = await fetch("http://localhost:5000/api/attendance/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch attendance summary");
  return res.json();
};

const deleteAssignmentAPI = async (token, id) => {
  const res = await fetch(`http://localhost:5000/api/assignments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete assignment");
  return res.json();
};


/* ========================
   MAIN COMPONENT
======================== */
const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  // Attendance → { subjectId: { present, total } }
  const [attendance, setAttendance] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalClasses: 0,
    totalPresent: 0,
    percentage: 0,
  });
  // Assignments
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
  });

  // Exams
  const [exams, setExams] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [examDateTime, setExamDateTime] = useState("");
  const [examPlannerPrompt, setExamPlannerPrompt] = useState("");
  const [examPlannerLoading, setExamPlannerLoading] = useState(false);
  const [examPlannerResult, setExamPlannerResult] = useState("");
  const [nextExamCountdown, setNextExamCountdown] = useState("");
  const [aiPlanExamId, setAiPlanExamId] = useState(null);
  const [selectedSubjectForProof, setSelectedSubjectForProof] = useState("");

  const [loading, setLoading] = useState(true);
  const [addingSubject, setAddingSubject] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [urgentNotices, setUrgentNotices] = useState([]);

  /* ========================
     FETCH SUBJECTS
  ======================== */
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const subjectsRes = await fetchSubjectsAPI(token);
        setSubjects(subjectsRes);

        // ✅ ADD THIS PART
        const summaryRes = await fetchAttendanceSummaryAPI(token);
        setAttendance(summaryRes.bySubject || {});
        setAttendanceSummary(
          summaryRes.overall || {
            totalClasses: 0,
            totalPresent: 0,
            percentage: 0,
          }
        );

        // ✅ Fetch assignments with error handling
        const assignmentsRes = await fetchAssignmentsAPI(token);
        setAssignments(Array.isArray(assignmentsRes) ? assignmentsRes : []);

        // ✅ Fetch exams
        const examsRes = await fetch("http://localhost:5000/api/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examsData = await examsRes.json();
        setExams(Array.isArray(examsData) ? examsData : []);

        // ✅ Fetch urgent notices
        const urgentRes = await fetch("http://localhost:5000/api/notices/urgent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (urgentRes.ok) {
          const urgentData = await urgentRes.json();
          setUrgentNotices(Array.isArray(urgentData) ? urgentData : []);
        }
      } catch (err) {
        if (err.message === "UNAUTHORIZED") {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setError("Failed to load data");
          setAssignments([]); // Prevent undefined
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [navigate]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!exams.length) return;

      const nextExam = getNextExam(exams);
      if (nextExam) {
        setNextExamCountdown(formatCountdown(nextExam.date));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exams]);

  useEffect(() => {
    if (!exams.length) return;

    const interval = setInterval(() => {
      const now = new Date();

      exams.forEach((exam) => {
        const examTime = new Date(exam.dateTime);
        const diff = examTime - now;

        if (diff > 0 && diff < 10 * 60 * 1000) {
          if (Notification.permission === "granted") {
            new Notification("📘 Exam Reminder", {
              body: `${exam.title} (${exam.subject}) starts at ${examTime.toLocaleTimeString()}`,
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [exams]);


  /* ========================
     LOGOUT
  ======================== */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ========================
     EXPORT ATTENDANCE PDF
  ======================== */
  const exportAttendancePDF = async () => {
    const input = document.getElementById("attendance-table");

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.text("Attendance Report", 10, 10);
    pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight);
    pdf.save("attendance-report.pdf");
  };

  /* ========================
     AI EXAM PLANNER
  ======================== */
  const handleAskAIPlan = async () => {
    if (!examPlannerPrompt.trim()) return;
    
    setExamPlannerLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ai/study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: 7,
          subjects: [examSubject],
          customPrompt: examPlannerPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExamPlannerResult(data.plan || "Study plan generated!");
      } else {
        setExamPlannerResult("Could not generate plan. Try again later.");
      }
    } catch (err) {
      console.error("AI Plan Error:", err);
      setExamPlannerResult("AI service unavailable. Please try again later.");
    } finally {
      setExamPlannerLoading(false);
    }
  };

  /* ========================
     EXAMS
  ======================== */
  const handleAddExam = async () => {
    if (!examTitle || !examSubject || !examDateTime) {
      alert("Fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: examTitle,
          subject: examSubject,
          dateTime: examDateTime,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add exam");
      }

      const data = await res.json();
      setExams((prev) => [...prev, data]);

      setExamTitle("");
      setExamSubject("");
      setExamDateTime("");
      setExamPlannerPrompt("");
      setExamPlannerResult("");
    } catch (err) {
      console.error("Add exam error:", err);
      alert(err.message || "Failed to add exam");
    }
  };

  const handleDeleteExam = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/exams/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setExams((prev) => prev.filter((e) => e._id !== id));
  };

  /* ========================
     ADD SUBJECT
  ======================== */
  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;

    try {
      setAddingSubject(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSubject }),
      });

      const data = await res.json();
      setSubjects((prev) => [...prev, data]);
      setNewSubject("");
    } catch {
      alert("Failed to add subject");
    } finally {
      setAddingSubject(false);
    }
  };

  /* ========================
     DELETE SUBJECT (ADDED)
  ======================== */
  const handleDeleteSubject = async (subjectId) => {
    const confirmDelete = window.confirm(
      "Delete this subject? Attendance will also be removed."
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/subjects/${subjectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove subject
      setSubjects((prev) => prev.filter((s) => s._id !== subjectId));

      // Remove attendance automatically
      setAttendance((prev) => {
        const updated = { ...prev };
        delete updated[subjectId];
        return updated;
      });
    } catch {
      alert("Failed to delete subject");
    }
  };
  const handleAddAssignment = async () => {
    if (!newAssignment.title || !newAssignment.subjectId || !newAssignment.dueDate)
      return alert("Fill all fields");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAssignment),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Add assignment failed:", text);
        alert("Failed to add assignment");
        return;
      }

      const data = await res.json();
      setAssignments((prev) => [...prev, data]);

      setNewAssignment({ title: "", subjectId: "", dueDate: "" });
    } catch (err) {
      console.error("Add assignment error:", err);
      alert("Failed to add assignment");
    }
  };

  const toggleAssignment = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/assignments/${id}/toggle`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error("Toggle assignment failed");
        return;
      }

      const updated = await res.json();
      setAssignments((prev) =>
        prev.map((a) => (a._id === id ? updated : a))
      );
    } catch (err) {
      console.error("Toggle assignment error:", err);
    }
  };

  /* ========================
     DELETE ASSIGNMENT
  ======================== */
  const handleDeleteAssignment = async (id) => {
    const ok = window.confirm("Delete this assignment?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      await deleteAssignmentAPI(token, id);

      // Remove from UI immediately
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert("Failed to delete assignment");
    }
  };


  /* ========================
     ATTENDANCE LOGIC
  ======================== */
  const markAttendanceAPI = async (token, subjectId, status) => {
    const res = await fetch("http://localhost:5000/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subjectId, status }),
    });
    if (!res.ok) throw new Error("Failed to mark attendance");
    return res.json();
  };

  const markAttendance = async (subjectId, status) => {
    // 1️⃣ UI update instantly
    setAttendance((prev) => {
      const current = prev[subjectId] || { present: 0, total: 0 };

      return {
        ...prev,
        [subjectId]: {
          total: current.total + 1,
          present:
            status === "present"
              ? current.present + 1
              : current.present,
        },
      };
    });

    // 2️⃣ Call backend silently
    try {
      const token = localStorage.getItem("token");
      await markAttendanceAPI(token, subjectId, status);

      // 3️⃣ Refresh summary silently
      const summaryRes = await fetchAttendanceSummaryAPI(token);
      setAttendance(summaryRes.bySubject || {});
      setAttendanceSummary(
        summaryRes.overall || {
          totalClasses: 0,
          totalPresent: 0,
          percentage: 0,
        }
      );
    } catch (err) {
      alert("Attendance failed to save");
    }
  };

  /* ========================
     UI STATES
  ======================== */
  if (loading) {
    return <DashboardLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  const overallAttendance = attendanceSummary.percentage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex transition-opacity duration-500 opacity-100 animate-fade-in">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white p-6 hidden md:block shadow-xl">
        <div className="mb-10 pb-4 border-b border-white/20">
          <BrandLogo
            titleClassName="text-white font-semibold"
            subtitleClassName="text-xs text-blue-200"
          />
        </div>

        {/* STUDENT MENU */}
        <nav className="space-y-1 text-sm">
          {[
            { label: "Dashboard", icon: "📊" },
            { label: "Subjects", icon: "📚" },
            { label: "Attendance", icon: "✅" },
            { label: "Assignments", icon: "📝" },
            { label: "Notes", icon: "📓" },
            { label: "AI Helper", icon: "🤖" },
            { label: "Notices", icon: "🔔" },
          ].map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.label}
              onClick={() => {
                if (item.label === "Notes") {
                  navigate("/notes");
                } else {
                  setActiveTab(item.label);
                }
              }}
            />
          ))}

          {/* Admin Link (Only for Admins) */}
          {user?.role === "admin" && (
            <>
              <div className="border-t border-white/20 my-4"></div>
              <SidebarItem
                icon="🛡️"
                label="Admin Panel"
                active={false}
                onClick={() => navigate("/admin")}
              />
            </>
          )}
        </nav>
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white p-6 z-50 md:hidden shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/20">
              <BrandLogo
                titleClassName="text-white font-semibold"
                subtitleClassName="text-xs text-blue-200"
              />
              <button onClick={() => setMobileMenuOpen(false)} className="text-white text-xl">✕</button>
            </div>

            <nav className="space-y-1 text-sm">
              {[
                { label: "Dashboard", icon: "📊" },
                { label: "Subjects", icon: "📚" },
                { label: "Attendance", icon: "✅" },
                { label: "Assignments", icon: "📝" },
                { label: "Notes", icon: "📓" },
                { label: "AI Helper", icon: "🤖" },
                { label: "Notices", icon: "🔔" },
              ].map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.label}
                  onClick={() => {
                    if (item.label === "Notes") {
                      navigate("/notes");
                    } else {
                      setActiveTab(item.label);
                      setMobileMenuOpen(false);
                    }
                  }}
                />
              ))}

              {user?.role === "admin" && (
                <>
                  <div className="border-t border-white/20 my-4"></div>
                  <SidebarItem
                    icon="🛡️"
                    label="Admin Panel"
                    active={false}
                    onClick={() => {
                      navigate("/admin");
                      setMobileMenuOpen(false);
                    }}
                  />
                </>
              )}
            </nav>
          </aside>
        </>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-700 hover:text-blue-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 md:flex-none">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Welcome, {user?.name || "Student"} 👋
                </h1>
                {user?.role === "admin" && (
                  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{activeTab}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 md:mt-0">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm transition"
            >
              🏠 Home
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm transition"
            >
              Logout
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </div>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "Dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Attendance</p>
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-3xl font-bold">{attendanceSummary.percentage}%</h2>
                <p className="text-xs opacity-75 mt-1">{attendanceSummary.totalPresent}/{attendanceSummary.totalClasses} classes</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Assignments Due</p>
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-3xl font-bold">{assignments.filter(a => !a.completed).length}</h2>
                <p className="text-xs opacity-75 mt-1">Pending tasks</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Next Exam</p>
                  <span className="text-2xl">📅</span>
                </div>
                {(() => {
                  const nextExam = getNextExam(exams);
                  return nextExam ? (
                    <>
                      <h2 className="text-lg font-bold">{nextExam.title}</h2>
                      <p className="text-xs opacity-75 mt-1">{new Date(nextExam.dateTime).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <p className="text-sm">No upcoming exams</p>
                  );
                })()}
              </div>
            </div>

            {/* Urgent Notices Banner */}
            {urgentNotices.length > 0 && (
              <div className="mb-6 space-y-3">
                {urgentNotices.map((notice) => (
                  <div
                    key={notice._id}
                    className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-4 shadow-md animate-pulse-slow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚨</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-red-800 text-lg">
                            {notice.title}
                          </h4>
                          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-semibold">
                            URGENT
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mt-2 leading-relaxed">
                          {notice.message}
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          Posted {new Date(notice.createdAt).toLocaleDateString()} at{" "}
                          {new Date(notice.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overallAttendance < 75 && (
              <div className="mb-6 p-4 rounded-xl border-l-4 border-red-500 bg-red-50 text-red-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold mb-1">Low Attendance Warning!</p>
                    <p className="text-sm">Your current attendance is <b>{overallAttendance}%</b>. Try to maintain at least <b>75%</b> to avoid issues.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Grid - Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              
              {/* Quick Notes */}
              <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📓</span> Quick Notes
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab("Notes")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <span>⬇️</span> View Notes
                  </button>
                  <button 
                    onClick={() => navigate("/notes")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <span>📝</span> Create Note
                  </button>
                </div>
              </div>

              {/* Ask the AI */}
              <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🤖</span> Ask the AI
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 mb-3">
                  How can I assist you today?
                </div>
                <button 
                  onClick={() => setActiveTab("AI Helper")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Open AI Chat
                </button>
              </div>

              {/* Upcoming Reminders */}
              <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>⏰</span> Upcoming Reminders
                </h3>
                <ul className="text-sm space-y-2.5">
                  {assignments.filter(a => !a.completed).slice(0, 2).map((assignment, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-500">📌</span>
                      <span><b>{assignment.title}</b> – Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </li>
                  ))}
                  {(() => {
                    const nextExam = getNextExam(exams);
                    return nextExam && (
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-red-500">📌</span>
                        <span><b>Exam:</b> {nextExam.title} – {new Date(nextExam.dateTime).toLocaleDateString()}</span>
                      </li>
                    );
                  })()}
                  {assignments.filter(a => !a.completed).length === 0 && exams.length === 0 && (
                    <li className="text-gray-400 italic">No upcoming reminders</li>
                  )}
                </ul>
              </div>

            </div>

            {/* 🥧 Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Chart takes 2 columns */}
              <div className="lg:col-span-2 min-h-[400px]">
                <AttendancePieChart attendance={attendance} />
              </div>

              {/* Activity Feed takes 1 column */}
              <ActivityFeed />
            </div>

            <div className="border-t my-6" />

            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <h3 className="font-semibold mb-2">⏳ Next Exam Countdown</h3>
              {nextExamCountdown ? (
                <p className="text-xl font-bold text-indigo-600">
                  {nextExamCountdown}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming exams</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-4 md:p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">📝 Upcoming Exams</h3>

              <div className="grid gap-3 mb-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Exam title"
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="datetime-local"
                  value={examDateTime}
                  onChange={(e) => setExamDateTime(e.target.value)}
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Exam Planner (AI Chat Style) */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🤖 AI Exam Planner (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={examPlannerPrompt}
                      onChange={(e) => setExamPlannerPrompt(e.target.value)}
                      placeholder="Ask AI to create a study plan..."
                      className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && examPlannerPrompt.trim()) {
                          handleAskAIPlan();
                        }
                      }}
                    />
                    <button
                      onClick={handleAskAIPlan}
                      disabled={examPlannerLoading || !examPlannerPrompt.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {examPlannerLoading ? '...' : 'Ask AI'}
                    </button>
                  </div>
                  {examPlannerResult && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-gray-700">
                      <p className="font-medium text-purple-700 mb-2">📚 Study Plan:</p>
                      <div className="max-h-[120px] overflow-y-auto pr-2">
                        <p className="whitespace-pre-line">{examPlannerResult}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleAddExam}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-medium transition"
                >
                  Add Exam
                </button>
              </div>

              {exams.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming exams</p>
              ) : (
                <ul className="space-y-2">
                  {exams.map((exam) => (
                    <li
                      key={exam._id}
                      className="border rounded p-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-sm text-gray-500">
                          {exam.subject?.name || exam.subject} • {new Date(exam.dateTime).toLocaleString()}
                        </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const days = Math.ceil(
                                (new Date(exam.dateTime) - new Date()) / (1000 * 60 * 60 * 24)
                              );
                              setAiPlanExamId(aiPlanExamId === exam._id ? null : exam._id);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            title="Generate AI Study Plan"
                          >
                            🤖 Study Plan
                          </button>

                          <button
                            onClick={() => {
                              const start = new Date(exam.dateTime)
                                .toISOString()
                                .replace(/-|:|\.\d\d\d/g, "");
                              const end = new Date(
                                new Date(exam.dateTime).getTime() + 60 * 60 * 1000
                              )
                                .toISOString()
                                .replace(/-|:|\.\d\d\d/g, "");

                              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                                exam.title
                              )}&dates=${start}/${end}&details=${encodeURIComponent(
                                exam.subject?.name || exam.subject
                              )}`;

                              window.open(url, "_blank");
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Add to Google Calendar
                          </button>

                          <button
                            onClick={() => handleDeleteExam(exam._id)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {aiPlanExamId === exam._id && (
                        <div className="mt-4 border-t pt-4">
                          <AIStudyPlannerForExam 
                            examTitle={exam.title}
                            examSubject={exam.subject?.name || exam.subject}
                            examDate={exam.dateTime}
                          />
                        </div>
                      )}

                      <div className="bg-slate-50 p-3 md:p-4 rounded-lg mt-3">
                        <h4 className="font-semibold text-sm md:text-base mb-3">📚 Study Plan</h4>
                        {generateStudyPlan(exam.dateTime).length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            Exam date has passed
                          </p>
                        ) : (
                          <div className="max-h-[120px] overflow-y-auto pr-2 space-y-2">
                            {generateStudyPlan(exam.dateTime).map((plan) => (
                              <div
                                key={plan.day}
                                className="border rounded-md p-2 text-xs md:text-sm bg-white hover:bg-gray-50 transition"
                              >
                                <span className="font-semibold text-blue-600">{plan.day}:</span> {plan.task}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ExamCalendar exams={exams} />

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <QuickNotes />
              <AIHelper />
              <AIStudyPlanner />
            </div>

            {/* Recent Assignments */}
            <div className="bg-white rounded-xl shadow p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4">📝 Recent Assignments</h3>
              {(assignments || []).length === 0 ? (
                <p className="text-gray-500 text-sm">No assignments yet</p>
              ) : (
                <ul className="space-y-3">
                  {(assignments || [])
                    .filter((a) => !a.completed)
                    .slice(0, 3)
                    .map((a) => (
                    <li
                      key={a._id}
                      className="flex justify-between items-center border p-3 rounded"
                    >
                      <div>
                        <p className={`font-semibold ${a.completed ? "line-through text-gray-400" : ""}`}>
                          {a.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {a.subject?.name || "No Subject"} • Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAssignment(a._id)}
                          className="px-3 py-1 text-sm rounded bg-orange-100 text-orange-700"
                        >
                          Mark Done
                        </button>

                        <button
                          onClick={() => handleDeleteAssignment(a._id)}
                          className="px-3 py-1 text-sm rounded bg-red-100 text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ================= SUBJECTS ================= */}
        {activeTab === "Subjects" && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold">📚 Your Subjects</h3>

            <div className="flex gap-3">
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={handleAddSubject}
                disabled={addingSubject}
                className={`px-4 rounded text-white ${
                  addingSubject
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {addingSubject ? "Adding..." : "Add"}
              </button>
            </div>

            {subjects.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No subjects yet. Add your first subject 👆
              </p>
            ) : (
              <ul className="space-y-2">
                {subjects.map((sub) => (
                  <li
                    key={sub._id}
                    className="bg-slate-100 px-4 py-2 rounded flex justify-between items-center"
                  >
                    <span>📘 {sub.name}</span>
                    <button
                      onClick={() => handleDeleteSubject(sub._id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ================= ATTENDANCE ================= */}
        {activeTab === "Attendance" && (
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h3 className="text-lg font-semibold">📅 Attendance Tracker</h3>

              <button
                onClick={exportAttendancePDF}
                className="w-full sm:w-auto bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-indigo-700 transition"
              >
                📄 Export PDF
              </button>
            </div>

            {/* MARK ATTENDANCE WITH PROOF */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold mb-3 text-blue-900">📸 Mark Attendance with Proof</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject:
                </label>
                <select
                  value={selectedSubjectForProof}
                  onChange={(e) => setSelectedSubjectForProof(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Choose a subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubjectForProof && (
                <AttendanceProofCapture
                  subjectId={selectedSubjectForProof}
                  subjectName={
                    subjects.find((s) => s._id === selectedSubjectForProof)?.name || ""
                  }
                  token={localStorage.getItem("token")}
                  onCancel={() => setSelectedSubjectForProof("")}
                  onSuccess={async () => {
                    // Refresh attendance data
                    const token = localStorage.getItem("token");
                    try {
                      const summaryRes = await fetchAttendanceSummaryAPI(token);
                      setAttendance(summaryRes.bySubject || {});
                      setAttendanceSummary({
                        overall: summaryRes.overall || 0,
                        present: summaryRes.present || 0,
                        absent: summaryRes.absent || 0,
                        leave: summaryRes.leave || 0,
                      });
                    } catch (err) {
                      console.error("Failed to refresh attendance:", err);
                    }
                    // ✅ Close proof form and return to attendance list
                    setSelectedSubjectForProof("");
                  }}
                />
              )}
            </div>

            {overallAttendance < 75 && (
              <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
                ⚠️ Low attendance alert: <b>{overallAttendance}%</b>
                <br />
                Maintain at least 75% attendance.
              </div>
            )}

            <div id="attendance-table" className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 border">Subject</th>
                  <th className="p-3 border">Mark</th>
                  <th className="p-3 border">Total</th>
                  <th className="p-3 border">Present</th>
                  <th className="p-3 border">%</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => {
                  const data = attendance[subject._id] || {
                    present: 0,
                    total: 0,
                  };

                  const presentCount = Number(data?.present || 0);
                  const totalCount = Number(data?.total || 0);

                  const percent =
                    totalCount === 0
                      ? "0%"
                      : `${Math.round((presentCount / totalCount) * 100)}%`;

                  return (
                    <tr key={subject._id}>
                      <td className="p-3 border">{subject.name}</td>
                      <td className="p-3 border space-x-2">
                        <button
                          onClick={() => setSelectedSubjectForProof(subject._id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded"
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            markAttendance(subject._id, "absent")
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded"
                        >
                          Absent
                        </button>
                      </td>
                      <td className="p-3 border text-center">
                        {data.total}
                      </td>
                      <td className="p-3 border text-center">
                        {data.present}
                      </td>
                      <td className="p-3 border text-center font-bold">
                        {percent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= OTHER TABS ================= */}
        {activeTab === "Assignments" && (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h3 className="text-lg font-semibold">📝 Assignments</h3>

            {/* ADD ASSIGNMENT */}
            <div className="grid md:grid-cols-4 gap-3">
              <input
                placeholder="Assignment title"
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />

              <select
                value={newAssignment.subjectId}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, subjectId: e.target.value })
                }
                className="border px-3 py-2 rounded"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />

              <button
                onClick={handleAddAssignment}
                className="bg-blue-600 text-white rounded px-4"
              >
                Add
              </button>
            </div>

            {/* LIST */}
            {assignments.length === 0 ? (
              <p className="text-gray-500">No assignments yet</p>
            ) : (
              <ul className="space-y-3">
                {(assignments || []).map((a) => (
                  <li
                    key={a._id}
                    className="flex justify-between items-center border p-3 rounded"
                  >
                    <div>
                      <p className={`font-semibold ${a.completed ? "line-through text-gray-400" : ""}`}>
                        {a.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {a.subject?.name || "No Subject"} • Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!a.completed && (
                        <button
                          onClick={() => toggleAssignment(a._id)}
                          className="px-3 py-1 text-sm rounded bg-orange-100 text-orange-700"
                        >
                          Mark Done
                        </button>
                      )}

                      {a.completed && (
                        <span className="px-3 py-1 text-sm rounded bg-green-100 text-green-700">
                          Completed
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteAssignment(a._id)}
                        className="px-3 py-1 text-sm rounded bg-red-100 text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "AI Helper" && (
          <div className="w-full">
            <AIHelper />
          </div>
        )}

        {activeTab === "Notices" && (
          <div className="w-full">
            <Notices />
          </div>
        )}

        {activeTab !== "Dashboard" &&
          activeTab !== "Subjects" &&
          activeTab !== "Attendance" &&
          activeTab !== "Assignments" &&
          activeTab !== "AI Helper" &&
          activeTab !== "Notices" && (
            <div className="bg-white rounded-xl shadow p-6 text-gray-600">
              🚧 <b>{activeTab}</b> module coming soon…
            </div>
          )}
      </main>
    </div>
  );
};

/* ========================
   COMPONENTS
======================== */

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`px-4 py-3 rounded-lg cursor-pointer transition flex items-center gap-3 ${
      active ? "bg-white/20 font-semibold shadow-md" : "hover:bg-white/10"
    }`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    <span>{label}</span>
  </div>
);

const ExamCalendar = ({ exams }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const hasExamOnDay = (day) =>
    exams.some((e) => {
      const d = new Date(e.dateTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">📅 Exam Calendar</h3>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-semibold text-gray-500">
            {d}
          </div>
        ))}

        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasExam = hasExamOnDay(day);

          return (
            <div
              key={day}
              className={`border rounded py-2 ${
                hasExam ? "bg-indigo-100 font-bold text-indigo-700" : ""
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow`}>
    <p className="text-sm opacity-90">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

const StudyPlanner = () => {
  const [daysLeft, setDaysLeft] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!daysLeft || isNaN(daysLeft) || daysLeft <= 0) {
      setPlan("Please enter a valid number of days.");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: parseInt(daysLeft),
          subjects: ["General"],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate study plan");
      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      console.error("Study planner error:", err);
      setPlan("Sorry, I couldn't generate a plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-4">📚 AI Study Planner</h3>
      <label className="block text-sm text-gray-600 mb-2">Days until exam:</label>
      <input
        type="number"
        placeholder="e.g. 7"
        value={daysLeft}
        onChange={(e) => setDaysLeft(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
      />
      <button
        onClick={generatePlan}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Study Plan"}
      </button>
      {plan && (
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200 text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {plan}
        </div>
      )}
    </div>
  );
};

const AIStudyPlannerForExam = ({ examTitle, examSubject, examDate }) => {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setError("");
    setPlan("");

    try {
      const days = Math.ceil(
        (new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (days <= 0) {
        setError("Exam date has passed");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in first");
        return;
      }

      const res = await fetch("http://localhost:5000/api/ai/study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days,
          subjects: [examSubject]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPlan(data.plan);
    } catch (err) {
      setError("Failed to generate plan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded">
      <h4 className="font-semibold mb-2">📚 AI Study Plan for {examTitle}</h4>
      <button
        onClick={generatePlan}
        disabled={loading}
        className="mb-3 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 font-medium"
      >
        {loading ? "Generating..." : "Generate AI Study Plan"}
      </button>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {plan && (
        <div className="bg-white p-3 rounded border border-purple-200">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{plan}</pre>
        </div>
      )}
    </div>
  );
};

const QuickNotes = () => (
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="font-semibold mb-4">📘 Quick Notes</h3>
    <button className="w-full bg-blue-600 text-white py-2 rounded mb-3">
      Download Notes
    </button>
    <button className="w-full bg-green-500 text-white py-2 rounded">
      View Materials
    </button>
  </div>
);

const Reminders = ({ reminders }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="font-semibold mb-4">⏰ Upcoming Reminders</h3>
    {reminders.length === 0 ? (
      <p className="text-gray-500 text-sm">No reminders 🎉</p>
    ) : (
      <ul className="text-sm text-gray-600 space-y-3">
        {reminders.map((item, index) => (
          <li key={index}>📌 {item}</li>
        ))}
      </ul>
    )}
  </div>
);

export default StudentDashboard;
