import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Doctor Portal</h2>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/DoctorDashboard"
          className={location.pathname === "/DoctorDashboard" ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🏠</i>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/DoctorDashboard/profile"
          className={isActive("/profile") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">👤</i>
          <span>My Profile</span>
        </Link>
        <Link
          to="/DoctorDashboard/appointments"
          className={isActive("/appointments") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">📅</i>
          <span>Appointments</span>
        </Link>
        <Link
          to="/DoctorDashboard/telemedicine"
          className={isActive("/telemedicine") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">💻</i>
          <span>Telemedicine</span>
        </Link>
        <Link
          to="/DoctorDashboard/patients"
          className={isActive("/patients") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🏥</i>
          <span>Patients</span>
        </Link>
        <Link
          to="/DoctorDashboard/prescriptions"
          className={isActive("/prescriptions") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">💊</i>
          <span>Prescriptions</span>
        </Link>
        <Link
          to="/DoctorDashboard/emergency"
          className={isActive("/emergency") ? "nav-item active" : "nav-item"}
        >
          <i className="icon">🚨</i>
          <span>Emergency</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <Link to="/" className="nav-item">
          <i className="icon">🏡</i>
          <span>Home</span>
        </Link>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
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
