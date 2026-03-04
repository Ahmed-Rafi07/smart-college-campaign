import { Navigate } from "react-router-dom";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user?.role);
  const requiredRole = normalizeRole(role);

  const getRoleHomePath = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "teacher") return "/teacher";
    return "/student";
  };

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "admin" && requiredRole !== "admin") {
      return children;
    }
    return <Navigate to={getRoleHomePath()} replace />;
  }

  return children;
};

export default ProtectedRoute;
