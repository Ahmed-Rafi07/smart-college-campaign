import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminNewsletter from "./pages/AdminNewsletter";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import AIHelper from "./components/AIHelper";
import OnlineNotifier from "./components/OnlineNotifier";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingContactButton from "./components/FloatingContactButton";

const getRoleHomePath = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return "/student";

  try {
    const parsedUser = JSON.parse(storedUser);
    const normalizedRole = String(parsedUser?.role || "")
      .trim()
      .toLowerCase();

    if (normalizedRole === "admin") return "/admin";
    if (normalizedRole === "teacher") return "/teacher";
    return "/student";
  } catch {
    return "/student";
  }
};

const getStoredUser = () => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
};

function App() {
  const [user, setUser] = useState(getStoredUser);
  const isAuthenticated = Boolean(
    localStorage.getItem("token") && localStorage.getItem("user")
  );
  const authHomePath = getRoleHomePath();

  return (
    <BrowserRouter>
      <OnlineNotifier />
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home user={user} />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={authHomePath} replace /> : <Register />}
        />

        {/* STUDENT DASHBOARD (ROLE PROTECTED) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* STUDENT NOTES (ROLE PROTECTED) */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute role="student">
              <Notes />
            </ProtectedRoute>
          }
        />

        {/* USER PROFILE (PROTECTED) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="student">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* TEACHER DASHBOARD (ROLE PROTECTED) */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD (ROLE PROTECTED) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN SUB-ROUTES */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/newsletter"
          element={
            <ProtectedRoute role="admin">
              <AdminNewsletter />
            </ProtectedRoute>
          }
        />

        {/* AI HELPER (PROTECTED) */}
        <Route
          path="/student/ai-helper"
          element={
            <ProtectedRoute role="student">
              <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4">
                <AIHelper />
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="/ai-helper" element={<Navigate to="/student/ai-helper" replace />} />

        {/* Legacy AI route */}
        <Route path="/ai" element={<Navigate to="/student/ai-helper" replace />} />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-xl">
              404 – Page Not Found
            </div>
          }
        />
      </Routes>
      <FloatingContactButton />
    </BrowserRouter>
  );
}

export default App;
