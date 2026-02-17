import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Patient Portal</h2>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/PatientDashboard"
          className={location.pathname === "/PatientDashboard" ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🏠</i>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/PatientDashboard/profile"
          className={isActive("/profile") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">👤</i>
          <span>My Profile</span>
        </Link>
        <Link
          to="/PatientDashboard/appointments"
          className={isActive("/appointments") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📅</i>
          <span>Appointments</span>
        </Link>
        <Link
          to="/PatientDashboard/medical-records"
          className={isActive("/medical-records") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📋</i>
          <span>Medical Records</span>
        </Link>
        <Link
          to="/PatientDashboard/prescriptions"
          className={isActive("/prescriptions") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">💊</i>
          <span>Prescriptions</span>
        </Link>
        <Link
          to="/PatientDashboard/reports"
          className={isActive("/reports") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📊</i>
          <span>Lab Reports</span>
        </Link>
        <Link
          to="/PatientDashboard/teleconsultation"
          className={isActive("/teleconsultation") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">💻</i>
          <span>Teleconsultation</span>
        </Link>
        <Link
          to="/PatientDashboard/billing"
          className={isActive("/billing") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">💳</i>
          <span>Billing</span>
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
