import React, { useState, useEffect } from "react";
import Sidebar from "./staff/Sidebar";
import Profile from "./staff/Profile";
import Appointments from "./staff/Appointments";
import LabTests from "./staff/LabTests";
import "./MedicalStaffDashboard.css";

const MedicalStaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    appointments: 0,
    labTests: 0,
    ongoingAppointments: 0,
    upcomingAppointments: 0,
    doctorCalls: 0,
  });

  useEffect(() => {
    // Fetch summary stats from backend
    fetch("/api/medicalstaff/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    // Clear session or token and redirect
    fetch("/api/logout").then(() => {
      window.location.href = "/login";
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "appointments":
        return <Appointments />;
      case "labTests":
        return <LabTests />;
      default:
        return (
          <div className="dashboard-overview">
            <div className="dashboard-header">
              <h2>Welcome to MediPortal!</h2>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            <p>Here’s a quick overview of your tasks:</p>

            <div className="overview-cards">
              <div className="card">
                <h3>Pending Appointments</h3>
                <p>{stats.appointments}</p>
              </div>
              <div className="card">
                <h3>Ongoing Appointments</h3>
                <p>{stats.ongoingAppointments}</p>
              </div>
              <div className="card">
                <h3>Upcoming Appointments</h3>
                <p>{stats.upcomingAppointments}</p>
              </div>
              <div className="card">
                <h3>Assigned Lab Tests</h3>
                <p>{stats.labTests}</p>
              </div>
              <div className="card">
                <h3>Doctor Calls</h3>
                <p>{stats.doctorCalls}</p>
              </div>
            </div>

            <div className="dashboard-actions">
              <button onClick={() => setActiveTab("appointments")}>Manage Appointments</button>
              <button onClick={() => setActiveTab("labTests")}>Manage Lab Tests</button>
              <button onClick={() => setActiveTab("profile")}>Edit Profile</button>
            </div>

            <p>Use the sidebar or above buttons to manage your tasks efficiently.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MedicalStaffDashboard;
