import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Nurse Portal</h2>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/NurseDashboard"
          className={location.pathname === "/NurseDashboard" ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🏠</i>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/NurseDashboard/profile"
          className={isActive("/profile") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">👤</i>
          <span>My Profile</span>
        </Link>
        <Link
          to="/NurseDashboard/patients"
          className={isActive("/patients") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🏥</i>
          <span>My Patients</span>
        </Link>
        <Link
          to="/NurseDashboard/ward-management"
          className={isActive("/ward-management") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🛏️</i>
          <span>Ward Management</span>
        </Link>
        <Link
          to="/NurseDashboard/medication"
          className={isActive("/medication") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">💊</i>
          <span>Medication</span>
        </Link>
        <Link
          to="/NurseDashboard/vital-signs"
          className={isActive("/vital-signs") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">❤️</i>
          <span>Vital Signs</span>
        </Link>
        <Link
          to="/NurseDashboard/reports"
          className={isActive("/reports") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📋</i>
          <span>Reports</span>
        </Link>
        <Link
          to="/NurseDashboard/schedule"
          className={isActive("/schedule") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📅</i>
          <span>My Schedule</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}>
          <i className="icon">🚪</i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
