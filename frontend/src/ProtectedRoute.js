import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const wantsAdmin = roles.includes("ADMIN");

  if (!token || !user) {
    return <Navigate to={wantsAdmin ? "/admin-login" : "/login"} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={user.role === "ADMIN" ? "/AdminDashboard" : "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
