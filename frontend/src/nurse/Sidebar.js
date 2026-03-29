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
          to="/NurseDashboard/schedule"
          className={location.pathname === "/NurseDashboard" || isActive("/schedule") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🗓️</i>
          <span>My Schedule</span>
        </Link>
        <Link
          to="/NurseDashboard/profile"
          className={isActive("/profile") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🪪</i>
          <span>My Profile</span>
        </Link>
        <Link
          to="/NurseDashboard/contacts"
          className={isActive("/contacts") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📞</i>
          <span>Department Contacts</span>
        </Link>
        <Link
          to="/NurseDashboard/patients"
          className={isActive("/patients") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">👥</i>
          <span>Assigned Patients</span>
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
