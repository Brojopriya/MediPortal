import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Medical Staff</h2>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/MedicalStaffDashboard"
          className={location.pathname === "/MedicalStaffDashboard" ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🏠</i>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/MedicalStaffDashboard/profile"
          className={isActive("/profile") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">👤</i>
          <span>Profile</span>
        </Link>
        <Link
          to="/MedicalStaffDashboard/appointments"
          className={isActive("/appointments") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📅</i>
          <span>Appointments</span>
        </Link>
        <Link
          to="/MedicalStaffDashboard/labTests"
          className={isActive("/labTests") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🔬</i>
          <span>Lab Tests</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <Link to="/" className="nav-item">
          <i className="icon">🏡</i>
          <span>Home</span>
        </Link>
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
